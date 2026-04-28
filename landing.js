import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {

    // =========================================================
    // 0. GATEKEEPER (Wajib Login)
    // =========================================================
    const checkAccess = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = "login.html";
        } else {
            document.body.style.opacity = '1';
        }
    };
    await checkAccess();

    // =========================================================
    // 1. LOGIKA BUKA-TUTUP SIDEBAR
    // =========================================================
    const btnProfile = document.getElementById('nav-profile-btn');
    const btnClose = document.getElementById('close-profile-btn');
    const btnLogout = document.getElementById('logout-btn');
    const backdrop = document.getElementById('profile-backdrop');
    const sidebar = document.getElementById('profile-sidebar');
    const profileForm = document.getElementById('profileForm');

    const openProfileSidebar = async () => {
        await loadProfileData(); // Tarik data dulu baru buka
        backdrop.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            backdrop.classList.add('opacity-100');
            sidebar.classList.remove('translate-x-full');
        }, 10);
        document.body.style.overflow = 'hidden';
    };

    const closeProfileSidebar = () => {
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0');
        sidebar.classList.add('translate-x-full');
        setTimeout(() => {
            backdrop.classList.add('hidden');
            document.body.style.overflow = '';
        }, 500);
    };

    // =========================================================
    // 2. AMBIL & UPDATE DATA PROFIL (SUPABASE)
    // =========================================================
    const loadProfileData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
            .from('profil_pengguna')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            document.getElementById('display-nama-header').innerText = profile.nama_lengkap || 'User';
            document.getElementById('display-nim-header').innerText = `ID: ${profile.nim || '-'}`;
            document.getElementById('display-status-badge').innerText = `Status: ${profile.status_akun || 'Aktif'}`;
            document.getElementById('display-prodi-badge').innerText = profile.prodi || '-';

            document.getElementById('input-email').value = user.email;
            document.getElementById('input-nama').value = profile.nama_lengkap || '';
            document.getElementById('input-usia').value = profile.usia || '';
            document.getElementById('input-prodi').value = profile.prodi || '';
        }
    };

    profileForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        
        const updatedData = {
            nama_lengkap: document.getElementById('input-nama').value,
            usia: parseInt(document.getElementById('input-usia').value) || 0,
            prodi: document.getElementById('input-prodi').value
        };

        const { error } = await supabase
            .from('profil_pengguna')
            .update(updatedData)
            .eq('id', user.id);

        if (error) alert("Error: " + error.message);
        else {
            alert("Sistem: Profil berhasil diperbarui!");
            await loadProfileData();
        }
    });

    // =========================================================
    // 3. LOGOUT SISTEM
    // =========================================================
    btnLogout?.addEventListener('click', async () => {
        if (confirm("Logout dari sistem Visage Metrics?")) {
            await supabase.auth.signOut();
            window.location.href = "login.html";
        }
    });

    // Event Listeners Klik
    if (btnProfile) btnProfile.addEventListener('click', openProfileSidebar);
    if (btnClose) btnClose.addEventListener('click', closeProfileSidebar);
    if (backdrop) backdrop.addEventListener('click', closeProfileSidebar);

    // =========================================================
    // 4. EFEK VISUAL (Navbar Scroll & Spy Scroll)
    // =========================================================
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-md', 'bg-white/95');
        } else {
            navbar.classList.remove('shadow-md', 'bg-white/95');
        }
    });
});