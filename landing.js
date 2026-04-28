// Import client Supabase
import { supabase } from 'supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // ... (Kode Efek Navbar & Spy Scroll tetap sama seperti milikmu) ...

    // =========================================================
    // 4. LOGIKA PROFIL & SUPABASE
    // =========================================================
    const btnProfile = document.getElementById('nav-profile-btn');
    const btnClose = document.getElementById('close-profile-btn');
    const backdrop = document.getElementById('profile-backdrop');
    const sidebar = document.getElementById('profile-sidebar');

    // Elemen isian profil di HTML (Pastikan ID ini ada di HTML kamu)
    const displayNama = document.getElementById('profile-name');
    const displayNIM = document.getElementById('profile-nim');
    const displayStatus = document.getElementById('profile-status');
    const displayRole = document.getElementById('profile-role');

    const loadUserProfile = async () => {
        // 1. Cek sesi user yang sedang login
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // 2. Ambil data dari tabel profil_pengguna
            const { data: profile, error } = await supabase
                .from('profil_pengguna')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Gagal mengambil profil:', error);
                return;
            }

            // 3. Suntik data ke UI Sidebar
            if (profile) {
                if (displayNama) displayNama.innerText = profile.nama_lengkap;
                if (displayNIM) displayNIM.innerText = profile.nim;
                if (displayStatus) {
                    displayStatus.innerText = profile.status_akun;
                    // Beri warna hijau jika aktif
                    displayStatus.className = profile.status_akun === 'aktif' 
                        ? 'text-green-500 font-bold' 
                        : 'text-red-500 font-bold';
                }
                if (displayRole) displayRole.innerText = profile.role;
            }
        } else {
            // Jika tidak ada user login, arahkan ke halaman login atau sembunyikan tombol
            console.log("User belum login.");
        }
    };

    const openSidebar = () => {
        loadUserProfile(); // Ambil data terbaru setiap kali dibuka
        backdrop.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            sidebar.classList.remove('translate-x-full');
        }, 10);
    };

    const closeSidebar = () => {
        backdrop.classList.add('opacity-0');
        sidebar.classList.add('translate-x-full');
        setTimeout(() => backdrop.classList.add('hidden'), 500);
    };

    if (btnProfile) btnProfile.addEventListener('click', openSidebar);
    if (btnClose) btnClose.addEventListener('click', closeSidebar);
    if (backdrop) backdrop.addEventListener('click', closeSidebar);
});