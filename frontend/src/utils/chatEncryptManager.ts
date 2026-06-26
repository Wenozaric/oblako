import { getPrivateKey } from './localDb'; // Твоя функция чтения приватного ключа из IndexedDB
import { importPublicKey, deriveSecretKey } from './localDb'; // Твои крипто-утилиты
import { socketService } from '../api/socket-io'; // Укажите правильный путь
// Хранилище AES-ключей в оперативной памяти текущей вкладки (кэш: roomId -> CryptoKey)
const activeKeysCache: Record<string, CryptoKey> = {};

/**
 * Получить или создать секретный AES-ключ для конкретной комнаты
 */

export async function getOrCreateRoomKey(roomId: string, recipientId: number): Promise<CryptoKey> {
    // 1. Если ключ для этой комнаты уже вычислялся ранее — отдаем его мгновенно из памяти
    if (activeKeysCache[roomId]) {
        return activeKeysCache[roomId];
    }

    // 2. ИСПРАВЛЕНО: Вместо fetch вызываем метод нашего сокет-сервиса!
    // Никаких ошибок 404 и SyntaxError с HTML-страницами вместо JSON
    const publicKeyBase64 = await socketService.getCompanionPublicKey(roomId, recipientId);

    // 3. Превращаем строку Base64 из базы данных обратно в объект ключа CryptoKey
    const recipientPublicKey = await importPublicKey(publicKeyBase64);

    // 4. Достаем НАШ приватный ключ из IndexedDB устройства
    const myPrivateKey = await getPrivateKey();
    if (!myPrivateKey) throw new Error('Приватный ключ не найден в IndexedDB этого устройства');

    // 5. СКРЕЩИВАЕМ НАШ ПРИВАТНЫЙ + ЧУЖОЙ ПУБЛИЧНЫЙ (Алгоритм Диффи-Хеллмана / ECDH)
    const sharedSecretKey = await deriveSecretKey(myPrivateKey, recipientPublicKey);

    // 6. Сохраняем получившийся AES-ключ в кэш
    activeKeysCache[roomId] = sharedSecretKey;

    return sharedSecretKey;
}
/**
 * Функция расшифровки любого входящего сообщения
 */
export async function decryptIncomingMessage(
    roomId: string,
    senderId: number,
    encryptedTextBase64: string,
    ivBase64: string
): Promise<string> {
    // 1. Получаем секретный AES-ключ для этой комнаты (метод выше проверит кэш или вычислит новый)
    const aesKey = await getOrCreateRoomKey(roomId, senderId);

    // 2. Переводим Base64-строки от сокета обратно в массивы байт (Uint8Array)
    const encryptedBytes = new Uint8Array([...atob(encryptedTextBase64)].map(c => c.charCodeAt(0)));
    const ivBytes = new Uint8Array([...atob(ivBase64)].map(c => c.charCodeAt(0)));

    // 3. Расшифровываем встроенным крипто-движком браузера (AES-GCM)
    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBytes },
        aesKey,
        encryptedBytes
    );

    // 4. Переводим получившиеся байты в обычную читаемую строку текста
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}

export async function encryptOutgoingMessage(
    roomId: string,
    recipientId: number,
    plainText: string
): Promise<{ ciphertext: string; iv: string }> {
    // 1. Получаем секретный AES-ключ для этой комнаты
    const aesKey = await getOrCreateRoomKey(roomId, recipientId);

    // 2. Генерируем случайный вектор инициализации (IV) для AES-GCM (12 байт — стандарт)
    const ivBytes = window.crypto.getRandomValues(new Uint8Array(12));

    // 3. Кодируем текст сообщения в байты
    const encoder = new TextEncoder();
    const plainBytes = encoder.encode(plainText);

    // 4. Шифруем крипто-движком браузера
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: ivBytes },
        aesKey,
        plainBytes
    );

    // 5. Переводим зашифрованные байты и IV в строки Base64 для передачи по сокету
    const ciphertextBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
    const ivBase64 = btoa(String.fromCharCode(...ivBytes));

    return {
        ciphertext: ciphertextBase64,
        iv: ivBase64
    };
}