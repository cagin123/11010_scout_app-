import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "tr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.scout": "Scout",
    "nav.history": "History",
    "nav.teams": "Teams",
    "nav.alliance": "Alliance",
    "nav.admin": "Admin",
    "nav.signOut": "Sign Out",
    "nav.title": "Team 11010 Scouting",

    // Regional
    "regional.label": "Regional",
    "regional.select": "Select Regional",
    "regional.noRegional": "No Regional",
    "regional.addNew": "Add New Regional",
    "regional.namePlaceholder": "Regional name...",
    "regional.add": "Add",
    "regional.manage": "Manage Regionals",
    "regional.delete": "Delete",
    "regional.active": "Active",

    // Alliance Builder
    "alliance.title": "Alliance Builder",
    "alliance.selectTeam": "Select Team",
    "alliance.addTeam": "Add Team",
    "alliance.searchPlaceholder": "Search by team number...",
    "alliance.noTeams": "No scouted teams found",
    "alliance.maxTeams": "Alliance can only have 3 teams",
    "alliance.alreadyAdded": "Team already in alliance",
    "alliance.projection": "Alliance Projection",
    "alliance.combinedScore": "Combined Score",
    "alliance.avgClimb": "Avg Climb",
    "alliance.avgReliability": "Avg Reliability",
    "alliance.climbCoverage": "Climb Coverage",
    "alliance.highScoring": "High Scoring",
    "alliance.risky": "Risky",
    "alliance.balanced": "Balanced",
    "alliance.warnReliability": "Low average reliability - high breakdown risk",
    "alliance.warnClimb": "Insufficient climb coverage",
    "alliance.warnAutoOverlap": "Auto scoring overlap - teams may compete for same positions",

    // Sign In
    "signIn.title": "Team 11010 Scouting App",
    "signIn.subtitle": "REBUILT™ 2026",
    "signIn.teamNumber": "Team Number",
    "signIn.username": "Username",
    "signIn.password": "Password",
    "signIn.button": "Sign In",
    "signIn.contact": "Want to use this app for your team? Send us an email at",
    "signIn.footer": "Team 11010 Scouting App • FIRST Robotics Competition 2026",
    "signIn.agreementCheck": "I have read and accept the",
    "signIn.agreementLink": "User Agreement",
    "signIn.agreementTitle": "User Agreement",
    "signIn.agreementContent": `USER AGREEMENT

App Name: Team 11010 Scouting App
Effective Date: 2025
Operated by: Team 11010 Bobcats

1. Educational Project & Independence

This Application is an educational project developed and operated by Team 11010 Bobcats for scouting and match analysis during the FIRST Robotics Competition (FRC) 2026 season.

This Application is an independent student-developed tool and is not affiliated with, endorsed by, or sponsored by FIRST® or the FIRST Robotics Competition.

FIRST® and FIRST Robotics Competition® are registered trademarks of FIRST.

2. Purpose

The Application allows users to:
• Record match scouting data
• Analyze team and match performance
• Generate strategic insights

The Application is intended solely for educational and competitive robotics purposes.

3. Data Collection & Storage

The Application may collect:
• Match scouting data entered by users
• Team numbers and performance statistics
• Basic device or usage information required for functionality

Data may be stored:
• Locally on your device
• On shared team storage (if enabled)

Team 11010 Bobcats does not sell or commercially distribute user data.

4. Data Loss Disclaimer

Due to the nature of robotics competitions and venue network conditions, including limited connectivity or technical failures, data loss may occur.

Team 11010 Bobcats does not guarantee:
• Continuous availability of the Application
• Successful synchronization of scouting data
• Permanent storage or backup of entered data

Users are solely responsible for verifying and backing up important scouting information.

5. Data Ownership

All scouting data entered by users remains the property of the user or their respective team.

By using the Application, users grant Team 11010 Bobcats a limited, non-exclusive permission to store and process the data solely for operational functionality of the Application.

6. Acceptable Use

You agree not to:
• Use the Application for unlawful purposes
• Attempt to disrupt or damage the Application
• Reverse engineer, decompile, or modify the software
• Intentionally falsify scouting data

Access may be restricted in cases of misuse.

7. No Competitive Guarantee

The Application provides analytical tools and data recording features only.

Team 11010 Bobcats does not guarantee:
• Competitive success
• Match outcomes
• Improved rankings
• Strategic accuracy

All competitive decisions remain the sole responsibility of the user or their team.

8. Disclaimer of Warranty

The Application is provided "AS IS" and "AS AVAILABLE."

No warranties are made regarding:
• Accuracy of data analysis
• Reliability during competition events
• Error-free operation
• Compatibility with all devices

Use of the Application is at your own risk.

9. Limitation of Liability

To the maximum extent permitted by law, Team 11010 Bobcats shall not be liable for:
• Data loss
• Strategic or competitive decisions
• Loss of ranking or awards
• Any indirect, incidental, or consequential damages

10. Updates

This Agreement and the Application may be updated at any time. Continued use constitutes acceptance of any modifications.

11. Contact

Team: 11010 Bobcats
Email: hasalrobotics@gmail.com`,

    // Scout Match
    "scout.title": "Match Scouting",
    "scout.matchNumber": "Match #",
    "scout.teamNumber": "Team #",
    "scout.autonomous": "AUTONOMOUS",
    "scout.autoFuelTotal": "Auto Fuel (Total)",
    "scout.leftStartingZone": "Has Auto",
    "scout.autoClimbAttempted": "Auto Climb Attempted",
    "scout.teleop": "TELEOP",
    "scout.teleopFuelTotal": "Teleop Fuel (Total)",
    "scout.cyclesCompleted": "Cycles Completed",
    "scout.defense": "Defense",
    "scout.defenseNone": "None",
    "scout.defenseLight": "Light",
    "scout.defenseHeavy": "Heavy",
    "scout.effectiveOverBumps": "Effective Over Bumps",
    "scout.usedTrenchWell": "Used Trench",
    "scout.endgame": "ENDGAME",
    "scout.climbResult": "Climb Result",
    "scout.climbNone": "None",
    "scout.climbLow": "Low",
    "scout.climbMid": "Mid",
    "scout.climbHigh": "High",
    "scout.parkedOnly": "Parked Only",
    "scout.reliability": "ROBOT RELIABILITY",
    "scout.brokeDown": "Broke Down",
    "scout.tippedOver": "Tipped Over",
    "scout.lostComms": "Lost Comms",
    "scout.driverSkill": "Driver Skill",
    "scout.quickNotes": "QUICK NOTES",
    "scout.notesPlaceholder": "Add quick notes about this match...",
    "scout.saveMatch": "SAVE MATCH",
    "scout.saving": "Saving...",
    "scout.voiceActivated": "Voice input activated - speak your notes",
    "scout.errorMatchTeam": "Please enter match and team number",
    "scout.errorSignIn": "You must be signed in to save",
    "scout.successSave": "Match {match} saved for Team {team}",
    "scout.errorSave": "Failed to save: ",
    "scout.errorNoRegional": "Please select a regional before saving",
    "scout.confirmTitle": "Double Check Your Data",
    "scout.confirmMessage": "Please verify match #{match} for Team {team} before saving. Make sure all data is accurate.",
    "scout.confirmSave": "Confirm & Save",
    "scout.confirmCancel": "Go Back & Review",
    "alliance.dataWarning": "⚠️ Data shown is based on scouted matches only. Always double-check with real match footage before making alliance decisions.",

    // Match History
    "history.title": "Match History",
    "history.entries": "entries",
    "history.searchPlaceholder": "Search team, match or scout...",
    "history.noEntries": "No match entries recorded yet",
    "history.entry": "entry",
    "history.redAlliance": "Red Alliance",
    "history.blueAlliance": "Blue Alliance",
    "history.team": "team",
    "history.teams": "teams",
    "history.auto": "Auto",
    "history.teleop": "Teleop",
    "history.cycles": "Cycles",
    "history.climb": "Climb",
    "history.driver": "Driver",
    "history.leftZone": "Left Zone",
    "history.defense": "defense",
    "history.brokeDown": "Broke Down",
    "history.tipped": "Tipped",
    "history.lostComms": "Lost Comms",
    "history.deleted": "Match entry deleted",
    "history.deleteFailed": "Failed to delete entry",
    "history.exportCSV": "Export CSV",
    "history.exportPDF": "Export PDF",
    "history.exported": "Export completed successfully",

    // Teams
    "teams.title": "Teams",
    "teams.searchPlaceholder": "Search teams...",
    "teams.avgTotal": "Avg Total",
    "teams.avgAuto": "Avg Auto",
    "teams.avgTeleop": "Avg Teleop",
    "teams.climbPct": "Climb %",
    "teams.reliability": "Reliability",
    "teams.defense": "Defense",
    "teams.matches": "matches",

    // Team Profile
    "profile.back": "Back",
    "profile.noData": "No data found for Team {team}.",
    "profile.matchRecords": "match records",
    "profile.lastMatches": "Last {count} Matches",
    "profile.autoVsTeleop": "Auto vs Teleop Split",
    "profile.climbConsistency": "Climb Consistency",
    "profile.avgCycles": "Avg Cycles",
    "profile.reliable": "Reliable",
    "profile.failureRisk": "High Failure Risk",
    "profile.strongDefender": "Strong Defender",
    "profile.fastCycler": "Fast Cycler",

    // Rankings
    "rankings.title": "Rankings",
    "rankings.export": "Export",
    "rankings.exporting": "Exporting rankings to CSV...",
    "rankings.event": "Event",
    "rankings.eventName": "Regional Championship 2026",
    "rankings.teamsCount": "Teams",
    "rankings.lastUpdate": "Last Update",
    "rankings.lastUpdateValue": "2 min ago",
    "rankings.mp": "MP",

    // Admin
    "admin.title": "Admin Panel",
    "admin.subtitle": "Manage your team's users and regionals",
    "admin.teamLabel": "Team",
    "admin.username": "Username",
    "admin.teamNumber": "Team #",
    "admin.displayName": "Display Name",
    "admin.email": "Email",
    "admin.password": "Password",
    "admin.role": "Role",
    "admin.createUser": "Create User",
    "admin.userCreated": "User \"{username}\" created successfully",
    "admin.userExists": "This username already exists in your team",
    "admin.userDeleted": "User \"{username}\" deleted",
    "admin.cantDeleteSelf": "You cannot delete your own account",
    "admin.teamMembers": "Team Members",
    "admin.noRegionals": "No regionals added yet",
    "admin.confirmDeleteTitle": "Are you sure?",
    "admin.confirmDeleteUser": "This will permanently delete user \"{name}\". This action cannot be undone.",
    "admin.confirmDeleteRegional": "This will permanently delete the regional \"{name}\". This action cannot be undone.",
    "admin.confirmDelete": "Delete",
    "admin.confirmCancel": "Cancel",
    "admin.changePassword": "Change Password",
    "admin.newPassword": "New Password",
    "admin.passwordChanged": "Password for \"{username}\" changed successfully",
    "admin.passwordChangeFailed": "Failed to change password",
    "admin.resetTutorial": "Reset Tutorial",
    "admin.tutorialReset": "Tutorial will show on next page load",

    // Guest
    "signIn.guestButton": "Continue as Guest",
    "guest.readOnly": "You are in guest mode. Sign in to scout matches.",

    // Not Found
    "notFound.title": "404",
    "notFound.message": "Oops! Page not found",
    "notFound.returnHome": "Return to Home",
  },
  tr: {
    // Nav
    "nav.scout": "Scout",
    "nav.history": "Geçmiş",
    "nav.teams": "Takımlar",
    "nav.alliance": "İttifak",
    "nav.admin": "Yönetici",
    "nav.signOut": "Çıkış Yap",
    "nav.title": "Takım 11010 Scouting",

    // Regional
    "regional.label": "Bölgesel",
    "regional.select": "Bölgesel Seç",
    "regional.noRegional": "Bölgesel Yok",
    "regional.addNew": "Yeni Bölgesel Ekle",
    "regional.namePlaceholder": "Bölgesel adı...",
    "regional.add": "Ekle",
    "regional.manage": "Bölgeselleri Yönet",
    "regional.delete": "Sil",
    "regional.active": "Aktif",

    // Alliance Builder
    "alliance.title": "İttifak Oluşturucu",
    "alliance.selectTeam": "Takım Seç",
    "alliance.addTeam": "Takım Ekle",
    "alliance.searchPlaceholder": "Takım numarasına göre ara...",
    "alliance.noTeams": "Scout edilmiş takım bulunamadı",
    "alliance.maxTeams": "İttifakta en fazla 3 takım olabilir",
    "alliance.alreadyAdded": "Takım zaten ittifakta",
    "alliance.projection": "İttifak Projeksiyonu",
    "alliance.combinedScore": "Toplam Skor",
    "alliance.avgClimb": "Ort. Kule Tırmanma",
    "alliance.avgReliability": "Ort. Güvenilirlik",
    "alliance.climbCoverage": "Kule Tırmanma Kapsamı",
    "alliance.highScoring": "Yüksek Skorlu",
    "alliance.risky": "Riskli",
    "alliance.balanced": "Dengeli",
    "alliance.warnReliability": "Düşük ortalama güvenilirlik - yüksek arıza riski",
    "alliance.warnClimb": "Yetersiz kule tırmanma kapsamı",
    "alliance.warnAutoOverlap": "Otonom skor çakışması - takımlar aynı pozisyonlar için yarışabilir",

    // Sign In
    "signIn.title": "Takım 11010 Scouting Uygulaması",
    "signIn.subtitle": "REBUILT™ 2026",
    "signIn.teamNumber": "Takım Numarası",
    "signIn.username": "Kullanıcı Adı",
    "signIn.password": "Şifre",
    "signIn.button": "Giriş Yap",
    "signIn.contact": "Bu uygulamayı takımınız için kullanmak ister misiniz? Bize e-posta gönderin:",
    "signIn.footer": "Takım 11010 Scouting Uygulaması • FIRST Robotics Competition 2026",
    "signIn.agreementCheck": "Okudum ve kabul ediyorum:",
    "signIn.agreementLink": "Kullanıcı Sözleşmesi",
    "signIn.agreementTitle": "Kullanıcı Sözleşmesi",
    "signIn.agreementContent": `KULLANICI SÖZLEŞMESİ

Uygulama Adı: Takım 11010 Scouting Uygulaması
Yürürlük Tarihi: 2025
İşleten: Takım 11010 Bobcats

1. Eğitim Projesi ve Bağımsızlık

Bu Uygulama, FIRST Robotik Yarışması (FRC) 2026 sezonu için keşif ve maç analizi amacıyla Takım 11010 Bobcats tarafından geliştirilen ve işletilen bir eğitim projesidir.

Bu Uygulama, bağımsız bir öğrenci geliştirme aracıdır ve FIRST® veya FIRST Robotik Yarışması ile bağlantılı değildir, onlar tarafından onaylanmamış veya desteklenmemiştir.

FIRST® ve FIRST Robotics Competition® FIRST'in tescilli ticari markalarıdır.

2. Amaç

Uygulama kullanıcılara şunları sağlar:
• Maç keşif verilerini kaydetme
• Takım ve maç performansını analiz etme
• Stratejik içgörüler oluşturma

Uygulama yalnızca eğitim ve rekabetçi robotik amaçları için tasarlanmıştır.

3. Veri Toplama ve Depolama

Uygulama şunları toplayabilir:
• Kullanıcılar tarafından girilen maç keşif verileri
• Takım numaraları ve performans istatistikleri
• İşlevsellik için gerekli temel cihaz veya kullanım bilgileri

Veriler şu şekilde depolanabilir:
• Cihazınızda yerel olarak
• Paylaşılan takım depolamasında (etkinleştirilmişse)

Takım 11010 Bobcats kullanıcı verilerini satmaz veya ticari olarak dağıtmaz.

4. Veri Kaybı Uyarısı

Robotik yarışmalarının doğası ve mekan ağ koşulları nedeniyle, sınırlı bağlantı veya teknik arızalar dahil, veri kaybı yaşanabilir.

Takım 11010 Bobcats şunları garanti etmez:
• Uygulamanın sürekli kullanılabilirliği
• Keşif verilerinin başarılı senkronizasyonu
• Girilen verilerin kalıcı depolanması veya yedeklenmesi

Kullanıcılar önemli keşif bilgilerini doğrulamak ve yedeklemekten münhasıran sorumludur.

5. Veri Sahipliği

Kullanıcılar tarafından girilen tüm keşif verileri, kullanıcının veya ilgili takımın mülkiyetinde kalır.

Uygulamayı kullanarak, kullanıcılar Takım 11010 Bobcats'e verileri yalnızca Uygulamanın işlevsel işleyişi için depolama ve işleme konusunda sınırlı, münhasır olmayan bir izin verir.

6. Kabul Edilebilir Kullanım

Şunları yapmamayı kabul edersiniz:
• Uygulamayı yasadışı amaçlar için kullanmak
• Uygulamayı bozmaya veya zarar vermeye çalışmak
• Yazılımı tersine mühendislik yapmak, decompile etmek veya değiştirmek
• Kasıtlı olarak keşif verilerini tahrif etmek

Kötüye kullanım durumlarında erişim kısıtlanabilir.

7. Rekabet Garantisi Yoktur

Uygulama yalnızca analitik araçlar ve veri kayıt özellikleri sağlar.

Takım 11010 Bobcats şunları garanti etmez:
• Rekabetçi başarı
• Maç sonuçları
• İyileştirilmiş sıralamalar
• Stratejik doğruluk

Tüm rekabetçi kararlar tamamen kullanıcının veya takımın sorumluluğundadır.

8. Garanti Reddi

Uygulama "OLDUĞU GİBİ" ve "MEVCUT OLDUĞU ŞEKLİYLE" sağlanmaktadır.

Şunlarla ilgili garanti verilmez:
• Veri analizinin doğruluğu
• Yarışma etkinlikleri sırasında güvenilirlik
• Hatasız çalışma
• Tüm cihazlarla uyumluluk

Uygulamanın kullanımı kendi riskinize aittir.

9. Sorumluluk Sınırlaması

Yasaların izin verdiği azami ölçüde, Takım 11010 Bobcats şunlardan sorumlu tutulamaz:
• Veri kaybı
• Stratejik veya rekabetçi kararlar
• Sıralama veya ödül kaybı
• Dolaylı, arızi veya sonuç olarak ortaya çıkan zararlar

10. Güncellemeler

Bu Sözleşme ve Uygulama herhangi bir zamanda güncellenebilir. Kullanıma devam etmek, değişikliklerin kabul edilmesi anlamına gelir.

11. İletişim

Takım: 11010 Bobcats
E-posta: hasalrobotics@gmail.com`,

    // Scout Match
    "scout.title": "Maç Scouting",
    "scout.matchNumber": "Maç #",
    "scout.teamNumber": "Takım #",
    "scout.autonomous": "OTONOM",
    "scout.autoFuelTotal": "Otonom Yakıt Toplam",
    "scout.leftStartingZone": "Başlangıç Bölgesinden Çıktı",
    "scout.autoClimbAttempted": "Otonom Kule Tırmanması Denendi",
    "scout.teleop": "TELEOP",
    "scout.teleopFuelTotal": "Teleop Yakıt Toplam",
    "scout.cyclesCompleted": "Tamamlanan Döngü",
    "scout.defense": "Savunma",
    "scout.defenseNone": "Yok",
    "scout.defenseLight": "Hafif",
    "scout.defenseHeavy": "Ağır",
    "scout.effectiveOverBumps": "Tümsek Üzerinde Etkili",
    "scout.usedTrenchWell": "Hendeği İyi Kullandı",
    "scout.endgame": "OYUN SONU",
    "scout.climbResult": "Kule Tırmanma Sonucu",
    "scout.climbNone": "Yok",
    "scout.climbLow": "Düşük",
    "scout.climbMid": "Orta",
    "scout.climbHigh": "Yüksek",
    "scout.parkedOnly": "Sadece Park",
    "scout.reliability": "ROBOT GÜVENİLİRLİĞİ",
    "scout.brokeDown": "Arızalandı",
    "scout.tippedOver": "Devrildi",
    "scout.lostComms": "İletişim Kesildi",
    "scout.driverSkill": "Sürücü Becerisi",
    "scout.quickNotes": "HIZLI NOTLAR",
    "scout.notesPlaceholder": "Bu maç hakkında hızlı notlar ekleyin...",
    "scout.saveMatch": "MAÇI KAYDET",
    "scout.saving": "Kaydediliyor...",
    "scout.voiceActivated": "Sesli giriş aktif - notlarınızı söyleyin",
    "scout.errorMatchTeam": "Lütfen maç ve takım numarasını girin",
    "scout.errorSignIn": "Kaydetmek için giriş yapmalısınız",
    "scout.successSave": "Maç {match} Takım {team} için kaydedildi",
    "scout.errorSave": "Kaydetme başarısız: ",
    "scout.errorNoRegional": "Lütfen kaydetmeden önce bir bölgesel seçin",
    "scout.confirmTitle": "Verilerinizi Kontrol Edin",
    "scout.confirmMessage": "Maç #{match} Takım {team} için kaydedilecek. Lütfen tüm verilerin doğru olduğundan emin olun.",
    "scout.confirmSave": "Onayla ve Kaydet",
    "scout.confirmCancel": "Geri Dön ve Kontrol Et",
    "alliance.dataWarning": "⚠️ Gösterilen veriler yalnızca scout edilen maçlara dayanmaktadır. İttifak kararları vermeden önce gerçek maç görüntüleriyle mutlaka kontrol edin.",

    // Match History
    "history.title": "Maç Geçmişi",
    "history.entries": "kayıt",
    "history.searchPlaceholder": "Takım, maç veya scout ara...",
    "history.noEntries": "Henüz maç kaydı yok",
    "history.entry": "kayıt",
    "history.redAlliance": "Kırmızı İttifak",
    "history.blueAlliance": "Mavi İttifak",
    "history.team": "takım",
    "history.teams": "takım",
    "history.auto": "Otonom",
    "history.teleop": "Teleop",
    "history.cycles": "Döngü",
    "history.climb": "Kule Tırmanma",
    "history.driver": "Sürücü",
    "history.leftZone": "Bölge Çıkışı",
    "history.defense": "savunma",
    "history.brokeDown": "Arızalandı",
    "history.tipped": "Devrildi",
    "history.lostComms": "İletişim Kesildi",
    "history.deleted": "Maç kaydı silindi",
    "history.deleteFailed": "Kayıt silinemedi",
    "history.exportCSV": "CSV İndir",
    "history.exportPDF": "PDF İndir",
    "history.exported": "Dışa aktarma başarılı",

    // Teams
    "teams.title": "Takımlar",
    "teams.searchPlaceholder": "Takım ara...",
    "teams.avgTotal": "Ort. Toplam",
    "teams.avgAuto": "Ort. Otonom",
    "teams.avgTeleop": "Ort. Teleop",
    "teams.climbPct": "Kule Tırmanma %",
    "teams.reliability": "Güvenilirlik",
    "teams.defense": "Savunma",
    "teams.matches": "maç",

    // Team Profile
    "profile.back": "Geri",
    "profile.noData": "Takım {team} için veri bulunamadı.",
    "profile.matchRecords": "maç kaydı",
    "profile.lastMatches": "Son {count} Maç",
    "profile.autoVsTeleop": "Otonom vs Teleop Dağılımı",
    "profile.climbConsistency": "Kule Tırmanma Tutarlılığı",
    "profile.avgCycles": "Ort. Döngü",
    "profile.reliable": "Güvenilir",
    "profile.failureRisk": "Yüksek Arıza Riski",
    "profile.strongDefender": "Güçlü Savunmacı",
    "profile.fastCycler": "Hızlı Döngücü",

    // Rankings
    "rankings.title": "Sıralamalar",
    "rankings.export": "Dışa Aktar",
    "rankings.exporting": "Sıralamalar CSV'ye aktarılıyor...",
    "rankings.event": "Etkinlik",
    "rankings.eventName": "Bölgesel Şampiyonası 2026",
    "rankings.teamsCount": "Takımlar",
    "rankings.lastUpdate": "Son Güncelleme",
    "rankings.lastUpdateValue": "2 dk önce",
    "rankings.mp": "MO",

    // Admin
    "admin.title": "Yönetici Paneli",
    "admin.subtitle": "Takımınızın kullanıcılarını ve bölgesellerini yönetin",
    "admin.teamLabel": "Takım",
    "admin.username": "Kullanıcı Adı",
    "admin.teamNumber": "Takım #",
    "admin.displayName": "Görünen Ad",
    "admin.email": "E-posta",
    "admin.password": "Şifre",
    "admin.role": "Rol",
    "admin.createUser": "Kullanıcı Oluştur",
    "admin.userCreated": "Kullanıcı \"{username}\" başarıyla oluşturuldu",
    "admin.userExists": "Bu kullanıcı adı takımınızda zaten mevcut",
    "admin.userDeleted": "Kullanıcı \"{username}\" silindi",
    "admin.cantDeleteSelf": "Kendi hesabınızı silemezsiniz",
    "admin.teamMembers": "Takım Üyeleri",
    "admin.noRegionals": "Henüz bölgesel eklenmemiş",
    "admin.confirmDeleteTitle": "Emin misiniz?",
    "admin.confirmDeleteUser": "\"{name}\" kullanıcısı kalıcı olarak silinecek. Bu işlem geri alınamaz.",
    "admin.confirmDeleteRegional": "\"{name}\" bölgeseli kalıcı olarak silinecek. Bu işlem geri alınamaz.",
    "admin.confirmDelete": "Sil",
    "admin.confirmCancel": "İptal",
    "admin.changePassword": "Şifre Değiştir",
    "admin.newPassword": "Yeni Şifre",
    "admin.passwordChanged": "\"{username}\" kullanıcısının şifresi başarıyla değiştirildi",
    "admin.passwordChangeFailed": "Şifre değiştirilemedi",
    "admin.resetTutorial": "Tutorial'ı Sıfırla",
    "admin.tutorialReset": "Tutorial bir sonraki sayfa yüklemesinde gösterilecek",

    // Guest
    "signIn.guestButton": "Misafir Olarak Devam Et",
    "guest.readOnly": "Misafir modundasınız. Maç scout etmek için giriş yapın.",

    // Not Found
    "notFound.title": "404",
    "notFound.message": "Sayfa bulunamadı!",
    "notFound.returnHome": "Ana Sayfaya Dön",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("bobcats_lang");
    return (stored === "tr" ? "tr" : "en") as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("bobcats_lang", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
