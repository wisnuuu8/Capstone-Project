// Pastikan path import sesuai dengan struktur folder lu
import { supabase } from 'supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username'); 
    const passwordInput = document.getElementById('password');
    const btnLogin = document.getElementById('btn-login');

    // =========================================================
    // 1. GATEKEEPER: Cek Sesi Aktif
    // =========================================================
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            window.location.href = "index.html";
        }
    };
    await checkSession();

    // =========================================================
    // 2. LOGIKA LOGIN (Sesuai Dokumentasi .local)
    // =========================================================
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            alert("Username dan password jangan dikosongin, Wir!");
            return;
        }

        // Efek Loading
        btnLogin.disabled = true;
        btnLogin.textContent = "VERIFIKASI SISTEM...";

        try {
            // KONVERSI USERNAME KE EMAIL (Sesuai SETUP_GUIDE.md)
            const email = `${username}@visagemetrics.local`;

            // Tembak langsung ke Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email, 
                password: password,
            });

            if (authError) {
                // Jika gagal, cek pesan errornya
                console.error("Login Error:", authError.message);
                alert("Akses Ditolak: Username atau password salah!");
                resetButton();
            } else {
                // JIKA BERHASIL: Catat Log Aktivitas (Sesuai Dokumen Integrasi)
                const user = authData.user;
                
                await supabase.from('log_aktivitas').insert([
                    { 
                        tipe_log: 'LOGIN', 
                        deskripsi: `User ${username} berhasil masuk ke sistem`, 
                        user_id: user.id 
                    }
                ]);

                // Redirect ke Landing Page
                window.location.href = "index.html";
            }

        } catch (err) {
            console.error("System Error:", err);
            alert("Terjadi gangguan pada server Visage Metrics.");
            resetButton();
        }
    });

    function resetButton() {
        btnLogin.disabled = false;
        btnLogin.textContent = "LOGIN SISTEM";
    }
});