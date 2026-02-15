import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function clean<T extends Record<string, any>>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export async function loadUserState(userId: string) {
    try {
        const ref = doc(db, "users", userId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;
        return snap.data();
    } catch (err) {
        console.error("Load user state failed:", err);
        return null;
    }
}

export async function saveUserState(
    userId: string,
    data: {
        workspaces?: any[];
        events?: any[];
        messages?: Record<string, any[]>;
        peers?: any[];
        pendingPeers?: any[];
        decks?: Record<string, any[]>;
        activeSession?: any;
    }
) {
    try {
        const ref = doc(db, "users", userId);

        await setDoc(
            ref,
            clean({
                workspaces: data.workspaces ?? [],
                events: data.events ?? [],
                messages: data.messages ?? {},
                peers: data.peers ?? [],
                pendingPeers: data.pendingPeers ?? [],
                decks: data.decks ?? {},
                activeSession: data.activeSession ?? null,
                updatedAt: Date.now(),
            }),
            { merge: true }
        );
    } catch (err) {
        console.error("Save user state failed:", err);
    }
}
