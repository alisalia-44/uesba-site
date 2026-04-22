<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceuil - UESBA</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/animations.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
              /* Activity Carousel Styles */
.carousel-track {
    display: flex;
    transition: transform 0.5s ease-in-out;
    width: 100%;
}

.carousel-item {
    flex: 1 0 100%;
    min-width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
}

.carousel-item > div {
    width: 100%;
    max-width: 700px;
}

#activity-dots {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 32px;
    flex-wrap: wrap;
}

#activity-dots button {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    background: #d1d5db;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
}

#activity-dots button:hover {
    background: #9ca3af;
}

#activity-dots button.active {
    background: #16a34a;
    width: 32px;
    border-radius: 6px;
}
    </style>
</head>
<body>

    <header id="header">
        <div class="container">
            <div class="header-content">
                <a href="index.html" class="logo">
                    <div class="logo-image">
                        <img src="images/img.jpeg" alt="">
                    </div>
                    <div class="logo-text desktop">
                        <h1>UESBA</h1>
                        <p>Union des Étudiants  et Stagiaires Burkinabè en Algerie</p>
                    </div>
                    
                </a>

                <nav class="desktop-nav">
                    <a class="nav-link" href="index.html">Accueil</a>
                    <a class="nav-link active" href="actualites.html">Actualités</a>
                    <a class="nav-link" href="evenements.html">Événements</a>
                    <a class="nav-link" href="apropos.html">À Propos</a>
                    <a class="nav-link" href="contact.html">Contact</a>
                </nav>

                <button class="mobile-menu-btn" id="mobileMenuBtn">
                   <img src="https://img.icons8.com/ios-filled/32/198754/menu--v1.png" alt="Menu" class="menu-icon">
                    <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
           </div>
        </div>
   </header>

   <div class="mobile-menu" id="mobileMenu" style="width:78px;height: auto; ">
      <nav>
          <button class="mobile-nav-link active" data-page="index.html">Accueil</button>
          <button class="mobile-nav-link " data-page="actualites.html">Actualités</button>
          <button class="mobile-nav-link" data-page="evenements.html">Événements</button>
          <button class="mobile-nav-link" data-page="apropos.html">À Propos</button>
          <button class="mobile-nav-link" data-page="contact.html">Contact</button>
      </nav>
   </div>    
    <section class="hero1" style="background-image: url('images/usbapro.png'); background-position:bottom ; background-size: cover; object-fit:contain;">
    <div class="hero1-bg-img" ></div>
    <div class="hero1-overlay"></div>
    <div class="hero1-stars" >
        <img  src="https://img.icons8.com/ios-filled/24/198754/star.png" alt="Star" class="star star-1">
        <img src="https://img.icons8.com/ios-filled/24/198754/star.png" alt="Star" class="star star-2">
        <img src="https://img.icons8.com/ios-filled/24/198754/star.png" alt="Star" class="star star-3">
        <img src="https://img.icons8.com/ios-filled/24/198754/star.png" alt="Star" class="star star-4">
        <img src="https://img.icons8.com/ios-filled/24/198754/star.png" alt="Star" class="star star-5">
    </div>
    <div class="hero1-center-content" >
        <h1 class="hero1-title" style="animation: fadeInUp 0.8s ease-out forwards; animation-delay: 0.2s; opacity: 0;">Bienvenue à l'UESBA</h1>
        <h2 class="hero1-subtitle" style="animation: fadeInUp 0.8s ease-out forwards; animation-delay: 0.4s; opacity: 0;">Notre Mission</h2>
        <p class="hero1-desc" style="animation: fadeInUp 0.8s ease-out forwards; animation-delay: 0.6s; opacity: 0;">L'UESBA a pour mission de rassembler et soutenir les étudiants et stagiaires burkinabè en Algérie. Nous créons des opportunités de développement académique, culturel et social tout en préservant notre identité et nos valeurs burkinabè.</p>
        <div class="hero1-btns" style="animation: fadeInUp 0.8s ease-out forwards; animation-delay: 0.8s; opacity: 0;">
            <a style="text-decoration: none;" href="apropos.html" class="btn btn-primary hero1-btn">En Savoir Plus <img src="https://img.icons8.com/ios-filled/24/ffffff/arrow.png" alt="Arrow" style="vertical-align:middle;margin-left:8px;"/></a>
            <a style="text-decoration: none;"  href="contact.html" class="btn btn-secondary hero1-btn">Nous Contacter</a>
        </div>
    </div>
</section>

  




    

    <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
    </div>

    <div class="container" id="executive">
        <div class="section-header">
    <div class="section-header" style="background: linear-gradient(90deg, #16a34a 0%, #198754 100%); border-radius: 18px; box-shadow: 0 4px 24px rgba(22,163,74,0.10); padding: 32px 24px 24px 24px; margin-bottom: 32px; position: relative; overflow: hidden ; margin-top: 30px;">
        <div class="section-title-with-icons" style="display: flex; align-items: center; gap: 18px; justify-content: center;">
            <img src="https://img.icons8.com/color/48/000000/crown.png" alt="Crown" style="width:48px; height:48px; filter: drop-shadow(0 2px 8px #fff8);">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 2.5rem; color: #fff; letter-spacing: 2px; font-weight: 700; margin: 0; text-shadow: 0 2px 8px #0002;">
                <span style="margin-right: 10px;">⭐</span>Bureau Exécutif 2025-2026<span style="margin-left: 10px;">⭐</span>
            </h2>
            <img src="https://img.icons8.com/color/48/000000/crown.png" alt="Crown" style="width:48px; height:48px; filter: drop-shadow(0 2px 8px #fff8); transform: scaleX(-1);">
        </div>
        <p style="color: #e0ffe0; font-size: 1.25rem; text-align: center; margin-top: 18px; font-family: 'Inter', sans-serif; letter-spacing: 1px; text-shadow: 0 1px 4px #0002;">
            <img src="https://img.icons8.com/ios-filled/24/ffffff/star.png" style="vertical-align: middle; margin-right: 8px; filter: drop-shadow(0 1px 4px #16a34a);"/>Rencontrez les leaders de notre communauté<img src="https://img.icons8.com/ios-filled/24/ffffff/star.png" style="vertical-align: middle; margin-left: 8px; filter: drop-shadow(0 1px 4px #16a34a);"/>
        </p>
        <div style="position: absolute; top: -30px; left: -30px; width: 90px; height: 90px; background: rgba(255,255,255,0.08); border-radius: 50%; z-index: 0;"></div>
        <div style="position: absolute; bottom: -30px; right: -30px; width: 90px; height: 90px; background: rgba(255,255,255,0.08); border-radius: 50%; z-index: 0;"></div>
    </div>
       
        <div class="executive-grid">
                <!-- Salia ALI -->
                <div class="executive-card">
                    <div class="executive-image">
                        <img src="images/salia.jpeg" alt="Salia ALI">
                        <p class="badge">⭐</p>
                    </div>
                    <div class="executive-info">
                        <h3>SALIA ALI</h3>
                        <p class="position">Président</p>
                        <div class="executive-details">
                            <p>Licence en Informatique — INSFP de Relizane</p>
                        </div>
                        <div class="executive-contact">
                            <a href="mailto:alimansoursalia@gmail.com"><span>alimansoursalia@gmail.com</span></a>
                        </div>
                    </div>
                </div>

                <!-- Cheick Oumar -->
                <div class="executive-card">
                    <div class="executive-image">
                        <img src="images/omar.jpeg" alt="Cheick Oumar">
                        <p class="badge">⭐</p>
                    </div>
                    <div class="executive-info">
                        <h3>SOMA Dilomama Cheick Oumar</h3>
                        <p class="position">Vice-Président</p>
                        <div class="executive-details">
                            <p>Licence en Génie Mécanique — Université des frères Mentouri Constantine 1</p>
                        </div>
                        <div class="executive-contact">
                            <a href="mailto:somac9385@gmail.com"><span>somac9385@gmail.com</span></a>
                        </div>
                    </div>
                </div>

                <!-- Sia Raoul -->
                <div class="executive-card">
                    <div class="executive-image">
                        <img src="images/sia.jpg" alt="Sia Raoul">
                        <p class="badge">⭐</p>
                    </div>
                    <div class="executive-info">
                        <h3>SIA Raoul</h3>
                        <p class="position">Trésorier Général</p>
                        <div class="executive-details">
                            <p>Licence en Informatique — Université de Boumerdes</p>
                        </div>
                        <div class="executive-contact">
                            <a href="mailto:tresorier@uesba-dz.org"><span>tresorier@uesba-dz.org</span></a>
                        </div>
                    </div>
                </div>

                <!-- Job -->
                <div class="executive-card">
                    <div class="executive-image">
                        <img src="images/job.jpg" alt="Job">
                        <p class="badge">⭐</p>
                    </div>
                    <div class="executive-info">
                        <h3>ILBOUDO Job</h3>
                        <p class="position">Chargé de l'Organisation</p>
                        <div class="executive-details">
                            <p>Licence en Électronique Industrielle — INSFP de Relizane</p>
                        </div>
                        <div class="executive-contact">
                            <a href="mailto:jobilboudo489@gmail.com"><span>jobilboudo489@gmail.com</span></a>
                        </div>
                    </div>
                </div>

                <!-- Yili -->
                <div class="executive-card">
                    <div class="executive-image">
                        <img src="images/fadila.jpg" alt="Yili">
                        <p class="badge">⭐</p>
                    </div>
                    <div class="executive-info">
                        <h3>OUATTARA Yili Fadila</h3>
                        <p class="position">Chargé Académique</p>
                        <div class="executive-details">
                            <p>Licence en Langue Anglaise — Université Ziane Achour de Djelfa</p>
                        </div>
                        <div class="executive-contact">
                            <a href="mailto:fadilaouattara43@gmail.com"><span>fadilaouattara43@gmail.com</span></a>
                        </div>
                    </div>
                </div>

                <!-- KABRE Pegwendé Patrice -->
                <div class="executive-card">
                    <div class="executive-image">
                        <img src="images/patrice.jpeg" alt="KABRE Pegwendé Patrice">
                        <p class="badge">⭐</p>
                    </div>
                    <div class="executive-info">
                        <h3>KABRE Pegwendé Patrice</h3>
                        <p class="position">Responsable de Communication</p>
                        <div class="executive-details">
                            <p>Licence en Langue Française — Université Abderrahmane Mira de Béjaïa</p>
                        </div>
                        <div class="executive-contact">
                            <a href="mailto:peguend-wende-patrice.kabre@langue.univ-bejaia.dz"><span>peguend-wende-patrice.kabre@langue.univ-bejaia.dz</span></a>
                        </div>
                    </div>
                </div>

                <!-- TOU ICHAM -->
                <div class="executive-card">
                    <div class="executive-image">
                        <img src="images/icham.jpeg" alt="TOU ICHAM">
                        <p class="badge">⭐</p>
                    </div>
                    <div class="executive-info">
                        <h3>TOU ICHAM</h3>
                        <p class="position">Coordinateur exécutif de l'UESBA</p>
                        <div class="executive-details">
                            <p>Licence en Électrotechnique — Université de Laghouat</p>
                        </div>
                        <div class="executive-contact">
                            <a href="mailto:espoirtou28@gmail.com"><span>espoirtou28@gmail.com</span></a>
                        </div>
                    </div>
                </div>

                <!-- KOUDOUGOU SIMON -->
                <div class="executive-card">
                    <div class="executive-image">
                        <img src="images/affstg.jpeg" alt="KOUDOUGOU SIMON">
                        <p class="badge">⭐</p>
                    </div>
                    <div class="executive-info">
                        <h3>KOUDOUGOU Bangueba SIMON</h3>
                        <p class="position">Chargé des affaires stagiaires</p>
                        <div class="executive-details">
                            <p>Licence en Conducteur des travaux publics — Institut national draa ben khedda</p>
                        </div>
                        <div class="executive-contact">
                            <a href="mailto:banguebasimonkoudougou@gmail.com"><span>banguebasimonkoudougou@gmail.com</span></a>
                        </div>
                    </div>
                </div>

        </div>  
    </div>    
       
 <div class="section-footer">
    <a style="text-decoration: none;" href="apropos.html#bureau" class="btn btn-primary">
     Voir Tous les Bureaux <img src="https://img.icons8.com/ios-filled/24/ffffff/arrow.png" alt="Arrow" style="vertical-align:middle;margin-left:8px;"/>
        
    </a>
</div>


   
 <section style="margin-top: 60px; padding: 60px 0; background: #f8f9fa;">
    <div class="container">
         <div class="section">
           <a href="evenements.html" class="btn-top-right">
              Voir Tout →
           </a>
        </div>
                <div class="flex justify-between items-end mb-12 max-w-6xl mx-auto">
            <div>
                <h2 class="text-3xl md:text-4xl mb-2 text-left no-icon">Tous les Événements</h2>
                <p class="text-gray-500 text-sm" style="margin-top: 10px;">Découvrez tous les événements organisés par l'UESBA</p>
            </div>
            
        </div>
       
            <div style="margin-top: 20px;" class="container">
                
                
                <div style="display: flex; gap: 2rem; flex-wrap: wrap; justify-content: flex-start;">
                                    
                   <!-- Dynamic: latest 3 events  -->
                    <div id="home-latest-events" style="display: flex; gap: 2rem; flex-wrap: wrap; justify-content: center; width: 100%;"></div>
                                     
                                        
                </div>
            </div>
   </section>

    <!-- Section Actualités Récentes  -->
<section style="margin-top: 60px; padding: 60px 0; background: #f8f9fa;">
    <div class="container">
         <div class="section">
           <a href="actualites.html" class="btn-top-right">
              Voir Tout →
           </a>
        </div>
                <div class="flex justify-between items-end mb-12 max-w-6xl mx-auto">
            <div>
                <h2 class="text-3xl md:text-4xl mb-2 text-left no-icon">Actualités Récentes</h2>
                <p class="text-gray-500 text-sm">Restez informés de nos dernières nouvelles</p>
            </div>
            
        </div>
        <div class="relative max-w-5xl mx-auto group">
            <button onclick="prevNews()" class="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-lime-800 text-white rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div class="carousel-container">
                <div id="news-track" class="carousel-track">
                    <!-- News 1 -->
                    <div class="carousel-item" style="flex: 0 0 100%;">
                        <div class="bg-white rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row" style="min-height: 340px;">
                            <div class="md:w-2/5 relative h-64 md:h-auto overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=500&h=400&q=80" alt="AG" class="w-full h-full object-cover">
                                <span class="absolute top-4 left-4 bg-lime-700 text-white text-xs px-4 py-1 rounded-full uppercase font-bold">Événements</span>
                            </div>
                            <div class="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                                <div class="flex items-center gap-2 text-lime-700 text-sm font-medium mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/>
                                    </svg>
                                    15 janvier 2026
                                </div>
                                <h3 class="text-2xl font-bold mb-4" style="color: #000;">Assemblée Générale 2026 :<br>Bilan et Perspectives</h3>
                                <p class="text-gray-600 text-base mb-6 flex-1">Retour sur l'assemblée générale annuelle qui s'est tenue le 15 janvier 2026 à Alger.</p>
                                <button class="bg-lime-700 hover:bg-lime-800 text-white px-6 py-3 rounded font-medium w-full transition-all text-center">
                                    Lire Plus →
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- News 2 -->
                    <div class="carousel-item" style="flex: 0 0 100%;">
                        <div class="bg-white rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row" style="min-height: 340px;">
                            <div class="md:w-2/5 relative h-64 md:h-auto overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&h=400&q=80" alt="Culture" class="w-full h-full object-cover">
                                <span class="absolute top-4 left-4 bg-lime-700 text-white text-xs px-4 py-1 rounded-full uppercase font-bold">Culture</span>
                            </div>
                            <div class="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                                <div class="flex items-center gap-2 text-lime-700 text-sm font-medium mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/>
                                    </svg>
                                    05 février 2026
                                </div>
                                <h3 class="text-2xl font-bold mb-4" style="color: #000;">Soirée Culturelle :<br>Célébrer nos Racines</h3>
                                <p class="text-gray-600 text-base mb-6 flex-1">Une soirée exceptionnelle dédiée aux danses et mets traditionnels du Faso pour tous les étudiants burkinabè.</p>
                                <button class="bg-lime-700 hover:bg-lime-800 text-white px-6 py-3 rounded font-medium w-full transition-all text-center">
                                    Lire Plus →
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- News 3 -->
                    <div class="carousel-item" style="flex: 0 0 100%;">
                        <div class="bg-white rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row" style="min-height: 340px;">
                            <div class="md:w-2/5 relative h-64 md:h-auto overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=500&h=400&q=80" alt="Sport" class="w-full h-full object-cover">
                                <span class="absolute top-4 left-4 bg-lime-700 text-white text-xs px-4 py-1 rounded-full uppercase font-bold">Sport</span>
                            </div>
                            <div class="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                                <div class="flex items-center gap-2 text-lime-700 text-sm font-medium mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/>
                                    </svg>
                                    12 mars 2026
                                </div>
                                <h3 class="text-2xl font-bold mb-4" style="color: #000;">Coupe de l'Espoir :<br>Finale en Vue</h3>
                                <p class="text-gray-600 text-base mb-6 flex-1">Le tournoi de football inter-villes touche à sa fin. Rejoignez-nous pour soutenir vos équipes favorites !</p>
                                <button class="bg-lime-700 hover:bg-lime-800 text-white px-6 py-3 rounded font-medium w-full transition-all text-center">
                                    Lire Plus →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button onclick="nextNews()" class="absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-lime-800 text-white rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    </div>
</section>


        <!-- Footer-->
     <footer class="footer">
     <div class="footer-container">
        <div class="footer-content">
            <div class="footer-column">
                <div class="footer-brand">
                    <div class="footer-logo">
                      ⭐  
                    </div>
                    <h3>UESBA</h3>
                </div>
                <p>Union des Étudiants et Stagiaires Burkinabè en Algérie - Solidarité, Excellence, Unité</p>
            </div>

            <div class="footer-column">
                <h4>Contact</h4>
                <div class="contact-item">
                    <img src="https://img.icons8.com/ios-filled/24/198754/marker.png" alt="Location">
                    <p>Alger, Algérie</p>
                </div>
                <div class="contact-item">
                    <img src="https://img.icons8.com/ios-filled/24/198754/phone.png" alt="Phone">
                    <p>+213 0670462357</p>
                </div>
                <div class="contact-item">
                    <img src="https://img.icons8.com/ios-filled/24/198754/new-post.png" alt="Email">
                    <p>info.uesba@gmail.com</p>
                </div>
            </div>
        <div class="footer-column">
                <h4>Suivez-nous sur nos differents réseaux</h4>
                <div class="social-links">
                    <a href="https://www.facebook.com/share/1DLUmWxuC2/?mibextid=wwXIfr" aria-label="Facebook">
                        <img src="https://img.icons8.com/color/32/000000/facebook-new.png" alt="Facebook">
                    </a>
                   <a href="https://www.tiktok.com/@uesba_?_r=1&_t=ZS-94RGRiQQBmq" aria-label="TikTok">
                        <img src="https://img.icons8.com/color/32/000000/tiktok.png" alt="TikTok">
                    </a>
                    <a href="https://www.linkedin.com/company/uesba-officiel/" aria-label="LinkedIn">
                        <img src="https://img.icons8.com/color/32/000000/linkedin.png" alt="LinkedIn">
                    </a>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <div class="developers">
                <p><strong>Site développé par :</strong></p>
                <p>SIA RAOUL • ALI SALIA • TALL SOULEYMANE • BA YOBI</p>
            </div>
            <div class="footer-legal">
                <p>© 2026 UESBA. Tous droits réservés.</p>
                <div class="legal-links">
                    <a href="#">Mentions Légales</a>
                    <a href="#">Politique de Confidentialité</a>
                </div>
            </div>
        </div>
      </div>
    </footer>


<script>
document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', function() {
        const page = btn.getAttribute('data-page');
        if(page) window.location.href = page;
    });
});
document.querySelectorAll('.mobile-nav-link').forEach(btn => {
    btn.addEventListener('click', function() {
        const page = btn.getAttribute('data-page');
        if(page) window.location.href = page;
    });
});

// Configuration Actualités (3 items)
        const newsTrack = document.getElementById('news-track');
        const newsCount = 3;
        let currentNewsIndex = 0;

        function updateNewsCarousel() {
            newsTrack.style.transform = `translateX(-${currentNewsIndex * 100}%)`;
        }

        function nextNews() {
            currentNewsIndex = (currentNewsIndex + 1) % newsCount;
            updateNewsCarousel();
        }

        function prevNews() {
            currentNewsIndex = (currentNewsIndex - 1 + newsCount) % newsCount;
            updateNewsCarousel();
        }

        // Auto-play pour les actualités (5 secondes)
        let newsInterval = setInterval(nextNews, 5000);

        // Safe pause auto-play pour une éventuelle piste d'activités (si présente)
        try {
            if (typeof activityTrack !== 'undefined' && activityTrack && activityTrack.parentElement && typeof nextActivity === 'function') {
                if (typeof activityInterval !== 'undefined') {
                    activityTrack.parentElement.parentElement.addEventListener('mouseenter', () => clearInterval(activityInterval));
                    activityTrack.parentElement.parentElement.addEventListener('mouseleave', () => { activityInterval = setInterval(nextActivity, 5000); });
                }
            }
        } catch (e) { console.warn('Activity carousel handlers skipped:', e); }

        // Pause auto-play des actualités sur hover (gardes pour éviter erreurs)
        try {
            if (newsTrack && newsTrack.parentElement && newsTrack.parentElement.parentElement) {
                newsTrack.parentElement.parentElement.addEventListener('mouseenter', () => clearInterval(newsInterval));
                newsTrack.parentElement.parentElement.addEventListener('mouseleave', () => { newsInterval = setInterval(nextNews, 5000); });
            }
        } catch (e) { console.warn('News carousel handlers skipped:', e); }
</script>
    
   
    <script src="js/script.js"></script>
</body>
</html><?php /**PATH /home/u701682666/domains/uesba.org/public_html/backend/resources/views/index.blade.php ENDPATH**/ ?>