import { supabase } from 'supabaseClient.js';

document.addEventListener("DOMContentLoaded", function() {
    
    const formRegister = document.getElementById('registerForm');
    const inputUsername = document.getElementById('inputUsername'); // Username Njir
    const inputNim = document.getElementById('inputNim');
    const inputNama = document.getElementById('inputNama');
    const inputProdi = document.getElementById('inputProdi');
    const inputUsia = document.getElementById('inputUsia');
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
            // Buat email gaib untuk Supabase Auth
            const hiddenEmail = `${username}@visagemetrics.com`;

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
                    // Sesuai dengan isian yang lu minta tadi
                    const { error: profileError } = await supabase
                        .from('profil_pengguna')
                        .insert([
                            {
                                id: user.id, // FK ke auth.users
                                username: username,
                                nim: inputNim.value,
                                nama_lengkap: inputNama.value,
                                prodi: inputProdi.value,
                                usia: parseInt(inputUsia.value) || 0,
                                status_akun: 'aktif',
                                role: 'mahasiswa'
                            }
                        ]);

                    if (profileError) {
                        showError("Gagal Simpan Profil: " + profileError.message);
                        resetBtn();
                    } else {
                        // BERHASIL!
                        alert("Registrasi Berhasil! Silakan masuk menggunakan username Anda.");
                        window.location.href = "login.html";
                    }
                }

            } catch (err) {
                console.error(err);
                showError("Terjadi kesalahan sistem.");
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

    // Sembunyikan error saat user mulai mengetik ulang
    inputRepassword.addEventListener('input', () => {
        errorMsg.classList.add('hidden');
    });
});