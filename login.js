import { supabase } from 'supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username'); // Pake Username Njir
    const passwordInput = document.getElementById('password');
    const btnLogin = document.getElementById('btn-login');

    // 1. Cek Sesi Aktif
    const { data: { session } } = await supabase.auth.getSession();
    if (session) window.location.href = "index.html";

    // 2. Logika Login via Username
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            alert("Username dan password jangan dikosongin, Wir!");
            return;
        }

        btnLogin.disabled = true;
        btnLogin.textContent = "MENCARI USER...";

        try {
            // STEP A: Cari Email berdasarkan Username di tabel profil_pengguna
            const { data: profile, error: profileError } = await supabase
                .from('profil_pengguna')
                .select('id, username') 
                .eq('username', username)
                .single();

            if (profileError || !profile) {
                alert("Username kagak terdaftar, Wir. Cek lagi!");
                resetButton();
                return;
            }

            // NOTE: Karena Supabase Auth butuh email, 
            // kita asumsikan format email lu adalah username@student.tup.ac.id 
            // atau lu simpan kolom email di profil_pengguna.
            // Di sini gue pake trik: cari email asli dari user_id yang ketemu.
            
            btnLogin.textContent = "VERIFIKASI SANDI...";

            // STEP B: Karena kita nggak punya email-nya langsung (kecuali lu simpan di profil_pengguna), 
            // Kita coba login pake email yang "tersembunyi". 
            // Tips: Saat Register, pastikan lu simpan email & username dengan benar.
            
            // Jika lu nggak simpan email di tabel profil_pengguna, lu bisa pake format dummy 
            // (Hanya jika saat register lu pake format yang sama):
            const hiddenEmail = `${username}@visagemetrics.com`; 

            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: hiddenEmail, 
                password: password,
            });

            if (authError) {
                alert("Password salah, njir! Coba inget-inget lagi.");
                resetButton();
            } else {
                window.location.href = "index.html";
            }

        } catch (err) {
            console.error(err);
            alert("Sistem error, hubungi admin!");
            resetButton();
        }
    });

    function resetButton() {
        btnLogin.disabled = false;
        btnLogin.textContent = "LOGIN SISTEM";
    }
});