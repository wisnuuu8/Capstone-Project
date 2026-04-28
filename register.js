// Pastikan path import benar
import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", function() {
    
    const formRegister = document.getElementById('registerForm');
    const inputUsername = document.getElementById('inputUsername'); 
    const inputNim = document.getElementById('inputNim');
    const inputNama = document.getElementById('inputNama');
    const inputProdi = document.getElementById('inputProdi');
    const inputUsia = document.getElementById('inputUsia');
    const inputAngkatan = document.getElementById('inputAngkatan'); // Tambahan sesuai doc lu
    const inputPassword = document.getElementById('inputPasswordReg');
    const inputRepassword = document.getElementById('inputRepassword');
    const errorMsg = document.getElementById('errorMsg');
    const btnRegister = document.getElementById('btnRegister');

    if (formRegister) {
        formRegister.addEventListener('submit', async function(event) {
            event.preventDefault();

            // 1. Validasi Password Cocok
            if (inputPassword.value !== inputRepassword.value) {
                showError("Password tidak cocok! Harap cek kembali.");
                return;
            }

            // 2. Persiapan Data
            const username = inputUsername.value.trim();
            const password = inputPassword.value;
            
            // SESUAI DOKUMEN: Pake suffix .local
            const hiddenEmail = `${username}@visagemetrics.local`;

            // Loading State
            btnRegister.disabled = true;
            btnRegister.textContent = "Mendaftarkan Sistem...";

            try {
                // STEP A: Daftarkan Akun ke Supabase Auth
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: hiddenEmail,
                    password: password,
                });

                if (authError) {
                    showError("Gagal Daftar Auth: " + authError.message);
                    resetBtn();
                    return;
                }

                const user = authData.user;

                if (user) {
                    // STEP B: Masukkan Data ke Tabel profil_pengguna
                    const { error: profileError } = await supabase
                        .from('profil_pengguna')
                        .insert([
                            {
                                id: user.id, 
                                username: username,
                                nim: inputNim.value,
                                nama_lengkap: inputNama.value,
                                prodi: inputProdi.value,
                                usia: parseInt(inputUsia.value) || 0,
                                angkatan: parseInt(inputAngkatan.value) || 2026, // Default tahun ini
                                status_akun: 'aktif',
                                role: 'mahasiswa'
                            }
                        ]);

                    if (profileError) {
                        showError("Gagal Simpan Profil: " + profileError.message);
                        resetBtn();
                        return;
                    }

                    // STEP C: Catat Log Aktivitas (Sesuai dokumentasi lu)
                    await supabase.from('log_aktivitas').insert([
                        { 
                            tipe_log: 'REGISTER', 
                            deskripsi: `User baru terdaftar: ${username}`, 
                            user_id: user.id 
                        }
                    ]);

                    // BERHASIL!
                    alert("Registrasi Berhasil! Silakan masuk menggunakan username Anda.");
                    window.location.href = "login.html";
                }

            } catch (err) {
                console.error("Critical Error:", err);
                showError("Terjadi kesalahan sistem fatal.");
                resetBtn();
            }
        });
    }

    function showError(msg) {
        errorMsg.innerText = msg;
        errorMsg.classList.remove('hidden');
        inputRepassword.classList.add('border-red-500');
        setTimeout(() => inputRepassword.classList.remove('border-red-500'), 3000);
    }

    function resetBtn() {
        btnRegister.disabled = false;
        btnRegister.textContent = "DAFTAR SEKARANG";
    }

    inputRepassword.addEventListener('input', () => {
        errorMsg.classList.add('hidden');
    });
});