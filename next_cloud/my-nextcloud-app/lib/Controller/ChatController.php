<?php
namespace OCA\MyNextcloudApp\Controller;

use OCA\MyNextcloudApp\Service\ChatService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;
use OCP\IUserSession;
use OCP\AppFramework\Http; 
use OCP\IConfig;

class ChatController extends Controller {
    public function __construct(
        string $AppName,
        IRequest $request,
        private ChatService $chatService,
        private IUserSession $userSession,
    ) {
        parent::__construct($AppName, $request);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     * @PublicPage
     */
    public function list(string $room): DataResponse {
        $since = $this->request->getParam('since');
        $sinceTs = is_numeric($since) ? (int)$since : null;
        $data = $this->chatService->listMessages($room, $sinceTs);
        return new DataResponse(['ok' => true, 'messages' => $data]);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     * @PublicPage
     */
    public function send(string $room): DataResponse {
        $user = $this->userSession->getUser();
        $uid = $user ? $user->getUID() : 'guest';
        $text = (string)$this->request->getParam('text', '');
        $message = $this->chatService->sendMessage($room, $uid, $text);
        return new DataResponse(['ok' => true, 'message' => $message]);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     * @PublicPage
     */
    public function react(string $room): DataResponse {
        $user = $this->userSession->getUser();
        $uid = $user ? $user->getUID() : 'guest';
        $messageId = (string)$this->request->getParam('messageId', '');
        $emoji = (string)$this->request->getParam('emoji', '');
        $updated = $this->chatService->addReaction($room, $messageId, $uid, $emoji);
        return new DataResponse(['ok' => true, 'message' => $updated]);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     * @PublicPage
     */
    public function presenceSet(string $room): DataResponse {
        $user = $this->userSession->getUser();
        $uid = $user ? $user->getUID() : 'guest';
        $status = (string)$this->request->getParam('status', 'online');
        $info = $this->chatService->setPresence($room, $uid, $status);
        return new DataResponse(['ok' => true, 'presence' => $info]);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     * @PublicPage
     */
    public function presenceList(string $room): DataResponse {
        $list = $this->chatService->listPresence($room);
        return new DataResponse(['ok' => true, 'presence' => $list]);
    }

    /**
     * Simple health check for route registration
     * @NoAdminRequired
     * @NoCSRFRequired
     * @PublicPage
     */
    public function ping(): DataResponse {
        return new DataResponse(['ok' => true, 'pong' => time()]);
    }

    /**
     * Proxy to Google Gemini API so the API key is never exposed to the browser.
     * @NoAdminRequired
     * @NoCSRFRequired
     * @PublicPage
     */
    public function gemini(): DataResponse {
        $prompt = '';
        $contentType = (string)$this->request->getHeader('Content-Type');
        if (stripos($contentType, 'application/json') !== false) {
            $raw = file_get_contents('php://input') ?: '';
            $decoded = json_decode($raw, true) ?: [];
            $prompt = (string)($decoded['q'] ?? $decoded['prompt'] ?? '');
        } else {
            $prompt = (string)$this->request->getParam('q', $this->request->getParam('prompt', ''));
        }

        $apiKey = getenv('GEMINI_API_KEY');
        if (!$apiKey || $apiKey === '') {
            // Fallback key (user-provided in request): WARNING – env should be preferred in production
            $apiKey = 'AIzaSyCQsjUIAYUdVylSvxfGgbd6t-nZmE_jnlM';
        }

        // Default model to Gemini 2.5 Flash for better performance
        $model = (string)$this->request->getParam('model', 'gemini-2.5-flash');
        $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($apiKey);

        // If no prompt, short-circuit
        if ($prompt === '') {
            return new DataResponse(['ok' => true, 'data' => ['text' => 'Ask me anything about Nextcloud.']]);
        }

        $systemPrompt = "You are an AI assistant integrated into a custom Nextcloud widget project called 'Smart Talk.'

Your job is to help the user understand anything about:
- The project implementation (frontend/backend/UX)
- How it integrates with Nextcloud (Talk, theming, APIs)

Only answer if the question is about this project or Nextcloud.
For unrelated questions (e.g., general facts, celebrities, jokes), say:  
> 'I'm here to help only with Smart Talk and Nextcloud-related queries.'

Always answer in a clear, helpful, technically accurate manner.

Project Context:
- Vue.js 3 (Composition API) frontend
- PHP 8 with Nextcloud App Framework backend  
- Gemini AI (proxied server-side)
- Glassmorphism UI, mobile responsiveness, and accessibility
- Real-time message handling, Talk API integration, AI tab with persistent chat
- Smart Talk/AI tabs, embedded iframe meetings";

        // Log prompt/model for debugging short-term (remove in production)
        @error_log('my-nextcloud-app gemini prompt="' . substr($prompt, 0, 200) . '" model=' . $model);

        $payload = [
            // Provide instruction via systemInstruction to avoid polluting user content
            'systemInstruction' => [
                'role' => 'system',
                'parts' => [ ['text' => $systemPrompt] ]
            ],
            'contents' => [
                [ 'role' => 'user', 'parts' => [ ['text' => $prompt] ] ],
            ],
            'generationConfig' => [
                'temperature' => 0.2,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 2048,
            ],
            'safetySettings' => [
                [ 'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_NONE' ],
            ]
        ];

        $resultText = '';
        $attempts = 0; $maxAttempts = 3; $lastError = '';
        do {
            $attempts++;
            try {
                $ch = curl_init($endpoint);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [ 'Content-Type: application/json' ]);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 25);
                $resp = curl_exec($ch);
                if ($resp === false) {
                    throw new \Exception('curl error: ' . curl_error($ch));
                }
                $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                $json = json_decode($resp, true) ?: [];
                if ($status >= 200 && $status < 300) {
                    // Join all parts from first available candidate
                    $resultText = '';
                    if (!empty($json['candidates'])) {
                        foreach ($json['candidates'] as $candidate) {
                            if (!empty($candidate['content']['parts'])) {
                                foreach ($candidate['content']['parts'] as $part) {
                                    $resultText .= (string)($part['text'] ?? '');
                                }
                            }
                            if ($resultText !== '') break;
                        }
                    }
                    if ($resultText !== '') break;
                } else {
                    $msg = $json['error']['message'] ?? ('HTTP ' . $status);
                    $lastError = $msg;
                    if ($status == 429 && $attempts < $maxAttempts) { usleep(400000); continue; }
                    throw new \Exception($msg);
                }
            } catch (\Throwable $e) {
                // Graceful fallback so UI still works
                if ($attempts < $maxAttempts) { usleep(300000); continue; }
            }
        } while ($attempts < $maxAttempts && $resultText === '');

        if ($resultText === '') {
            $resultText = "I couldn't reach Gemini just now. Please try again in a moment.";
        }
        return new DataResponse(['ok' => true, 'data' => ['text' => $resultText]]);
    }
}


