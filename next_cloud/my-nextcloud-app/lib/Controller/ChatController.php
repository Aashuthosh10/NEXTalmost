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
            // Fallback to user-provided key if env not set
            $apiKey = 'AIzaSyCOeVPVHgE-WBaGQSY_3k1c6eAa3xiWbkk';
        }

        $model = (string)$this->request->getParam('model', 'gemini-1.5-flash');
        $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($apiKey);

        // If no prompt, short-circuit
        if ($prompt === '') {
            return new DataResponse(['ok' => true, 'data' => ['text' => 'Ask me anything about Nextcloud.']]);
        }

        $payload = [
            'contents' => [
                [
                    'parts' => [ ['text' => $prompt] ]
                ]
            ],
            'safetySettings' => [
                [ 'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_NONE' ],
            ]
        ];

        $resultText = '';
        try {
            $ch = curl_init($endpoint);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [ 'Content-Type: application/json' ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            $resp = curl_exec($ch);
            if ($resp === false) {
                throw new \Exception('curl error: ' . curl_error($ch));
            }
            $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $json = json_decode($resp, true) ?: [];
            if ($status >= 200 && $status < 300) {
                // Try to read unified text
                $resultText = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
            } else {
                $msg = $json['error']['message'] ?? ('HTTP ' . $status);
                throw new \Exception($msg);
            }
        } catch (\Throwable $e) {
            // Graceful fallback so UI still works
            $resultText = 'I could not reach Gemini right now. Here\'s a local answer: Nextcloud is a self-hosted platform for files and collaboration.';
        }

        return new DataResponse(['ok' => true, 'data' => ['text' => $resultText]]);
    }
}


