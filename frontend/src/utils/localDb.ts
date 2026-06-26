import { openDB } from 'idb'

const name = 'ChatKeyDb'
const store_name = 'keys'

const getDb = async () => {
    return await openDB(name, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(store_name)) {
                db.createObjectStore(store_name)
            }
        }
    })
}

export const savePrivateKey = async (key: CryptoKey) => {
    const db = await getDb()
    await db.put(store_name, key, 'private_key')
}

export const getPrivateKey = async () => {
    const db = await getDb()
    return await db.get(store_name, 'private_key')
}

export const generateKeyPair = async () => {
    return await window.crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        ['deriveKey', 'deriveBits']
    )
}

export const exportPublicKey = async (key: CryptoKey) => {
    const exported = await window.crypto.subtle.exportKey('spki', key)
    return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

export const importPublicKey = async (pemBase64: string) => {
    const binaryDerString = window.atob(pemBase64)
    const binaryDer = new Uint8Array(binaryDerString.length)
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i)
    }
    return await window.crypto.subtle.importKey(
        'spki',
        binaryDer,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        []
    )
}

export const deriveSecretKey = async (privateKey: CryptoKey, publicKey: CryptoKey) => {
    return await window.crypto.subtle.deriveKey(
        { name: 'ECDH', public: publicKey },
        privateKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

