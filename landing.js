import { supabase } from 'supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {

    // =========================================================
    // 0. PROTEKSI HALAMAN (GATEKEEPER)
    // =========================================================
    // Sembunyikan body sementara agar tidak terjadi "flicker" konten
    document.body.style.opacity = '0';

    const checkAccess = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Jika TIDAK ADA sesi aktif, langsung lempar ke login.html
        if (!session) {
            window.location.href = "login.html";
            return;
        }

        // Jika ADA sesi, tampilkan kembali body-nya
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease-in-out';
    };

    await checkAccess();

    // =========================================================
    // 1. EFEK NAVBAR SCROLL (Warna Background)
    // =========================================================
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-lg', 'bg-white/95');
            navbar.classList.remove('bg-white/80');
        } else {
            navbar.classList.remove('shadow-lg', 'bg-white/95');
            navbar.classList.add('bg-white/80');
        }
    });

    // =========================================================
    // 2. NAVIGASI LINKS & SMOOTH SCROLL
    // =========================================================
    const navMenuContainer = document.querySelector('.hidden.lg\\:flex'); 
    const navLinks = navMenuContainer ? navMenuContainer.querySelectorAll('a[href^="#"]') : [];
    const allScrollLinks = document.querySelectorAll('a[href^="#"]');

    allScrollLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // =========================================================
    // 3. LOGIKA GARIS BIRU (SPY SCROLL)
    // =========================================================
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        root: null,
        rootMargin: '-25% 0px -65% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('text-sky-600', 'border-b-2', 'border-sky-500');
                    link.classList.add('text-slate-500');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.remove('text-slate-500');
                        link.classList.add('text-sky-600', 'border-b-2', 'border-sky-500');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // =========================================================
    // 4. CEK STATUS LOGIN (Session-Based)
    // =========================================================
    const authBtn = document.getElementById("nav-auth-btn");
    
    const updateNavUI = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            authBtn.textContent = "SISTEM";
            authBtn.href = "form_pengguna.html"; 
        } else {
            authBtn.textContent = "LOGIN";
            authBtn.href = "login.html";
        }
    };
    
    await updateNavUI();

    // =========================================================
    // 5. LOGIKA SIDEBAR PROFIL & CRUD SUPABASE
    // =========================================================
    const btnProfile = document.getElementById('nav-profile-btn');
    const btnClose = document.getElementById('close-profile-btn');
    const btnLogout = document.getElementById('logout-btn');
    const backdrop = document.getElementById('profile-backdrop');
    const sidebar = document.getElementById('profile-sidebar');
    const profileForm = document.getElementById('form-update-profil');

    // Ambil data asli dari tabel profil_pengguna
    const loadProfileData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
            .from('profil_pengguna')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            // Update UI Sidebar
            document.getElementById('display-nama-header').innerText = profile.nama_lengkap || 'User';
            document.getElementById('display-nim-header').innerText = `ID: ${profile.nim || '-'}`;
            document.getElementById('display-status-badge').innerText = `Status: ${profile.status_akun || 'Aktif'}`;
            document.getElementById('display-prodi-badge').innerText = profile.prodi || '-';

            // Update Form Input
            document.getElementById('input-email').value = user.email;
            document.getElementById('input-nama').value = profile.nama_lengkap || '';
            document.getElementById('input-usia').value = profile.usia || '';
            document.getElementById('input-prodi').value = profile.prodi || '';
        }
    };

    const openProfileSidebar = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = "login.html"; 
            return;
        }

        await loadProfileData();
        backdrop.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            sidebar.classList.remove('translate-x-full');
        }, 10);
        document.body.style.overflow = 'hidden';
    };

    const closeProfileSidebar = () => {
        backdrop.classList.add('opacity-0');
        sidebar.classList.add('translate-x-full');
        setTimeout(() => {
            backdrop.classList.add('hidden');
            document.body.style.overflow = '';
        }, 500);
    };

    // Handler Update Profil
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

        if (error) {
            alert("Gagal update sistem: " + error.message);
        } else {
            alert("Profil berhasil diperbarui secara sistem!");
            await loadProfileData();
        }
    });

    // Handler Logout Sistem
    btnLogout?.addEventListener('click', async () => {
        if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
            const { error } = await supabase.auth.signOut();
            if (!error) {
                window.location.href = "login.html"; 
            }
        }
    });

    // Listeners UI
    if (btnProfile) btnProfile.addEventListener('click', openProfileSidebar);
    if (btnClose) btnClose.addEventListener('click', closeProfileSidebar);
    if (backdrop) backdrop.addEventListener('click', closeProfileSidebar);
});