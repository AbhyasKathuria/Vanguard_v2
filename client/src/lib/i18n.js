import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const translations = {
  en: {
    // Navigation
    nav_home: 'Home', nav_map: 'Live Map', nav_community: 'Community Chat',
    nav_ai: 'AI Assistant', nav_profile: 'Profile', nav_workers: 'Worker Market',
    nav_emergency: 'Emergency Alert', nav_officials: 'Officials Directory',
    
    // Home
    greeting_morning: 'Good morning', greeting_afternoon: 'Good afternoon',
    greeting_evening: 'Good evening', greeting_night: 'Good night',
    critical_issues: 'Critical Issues', community_updates: 'Community Updates',
    workers_nearby: 'Workers Nearby', ai_alerts: 'AI Alerts',
    view_all: 'View all', no_issues: 'No issues in your area',
    
    // Report
    report_issue: 'Report Issue', upload_photo: 'Upload Photo',
    take_photo: 'Take Photo or Upload', voice_note: 'Voice Note',
    add_description: 'Add description...', detect_location: 'Detect My Location',
    enter_manually: 'Enter Manually', analyze_ai: 'Analyze with AI',
    analyzing: 'Analyzing...', detecting_hazard: 'Detecting hazard type...',
    calculating_risk: 'Calculating risk score...', finding_authority: 'Finding authority...',
    download_pdf: 'Download PDF Report', share_community: 'Share with Community',
    submit_issue: 'Submit Issue', issue_submitted: 'Issue reported successfully!',
    
    // Severity
    severity_green: 'Minor', severity_yellow: 'Needs Attention',
    severity_orange: 'Urgent', severity_red: 'Dangerous',
    
    // Community
    general: 'General', emergency_ch: 'Emergency', workers_ch: 'Workers',
    announcements: 'Announcements', agriculture: 'Agriculture',
    type_message: 'Type a message...', send: 'Send',
    live_room: 'Live Room', hold_to_speak: 'Hold to Speak',
    speaking: 'Speaking...', join_broadcast: 'Join Broadcast',
    leave_room: 'Leave Room', in_room: 'in room',
    voice_message: 'Voice message', record_voice: 'Record Voice',
    stop_recording: 'Stop', cancel: 'Cancel',
    
    // Workers
    find_workers: 'Find Workers', post_job: 'Post a Job',
    my_posts: 'My Posts', search_skill: 'Search by skill...',
    hire: 'Hire', apply: 'Apply', available: 'Available',
    unavailable: 'Not Available', per_day: '/day',
    years_exp: 'years experience', apply_job: 'Apply for Job',
    your_rate: 'Your proposed rate (₹/day)',
    cover_message: 'Why are you the right person?',
    submit_application: 'Submit Application', application_sent: 'Application submitted!',
    
    // Emergency
    emergency_title: 'Emergency Alert',
    emergency_subtitle: 'Your alert reaches community members and officials instantly',
    fire: 'Fire', accident: 'Accident', medical: 'Medical',
    crime: 'Crime', flood: 'Flood', electric: 'Electric Hazard',
    send_alert: 'Send Emergency Alert', alert_sent: 'Alert sent!',
    confirm_alert: 'This will alert all community members and officials.',
    confirm: 'Confirm', active_emergencies: 'Active Emergencies',
    
    // AI
    ai_title: 'AI Assistant', ai_subtitle: 'Ask anything about civic issues',
    ai_placeholder: 'Ask a question...', ai_thinking: 'Thinking...',
    suggested_1: 'Water overflowing near school',
    suggested_2: 'Who handles electricity issues?',
    suggested_3: 'Garbage not collected for 3 days',
    suggested_4: 'How to report a pothole?',
    
    // Profile
    profile_title: 'Profile', edit_profile: 'Edit Profile',
    dark_mode: 'Dark Mode', light_mode: 'Light Mode',
    language: 'Language', notifications: 'Notifications',
    logout: 'Logout', issues_reported: 'Issues Reported',
    confirmations: 'Confirmations', community_score: 'Community Score',
    save: 'Save', saved: 'Saved!',
    
    // Officials
    officials_title: 'Officials Directory',
    search_officials: 'Search by name or department...',
    call: 'Call', email: 'Email', all: 'All',
    ward: 'Ward', police: 'Police', health: 'Health',
    electricity: 'Electricity', municipality: 'Municipality',
    
    // Auth
    select_language: 'Choose Your Language',
    i_am_a: 'I am a...',
    citizen: 'Citizen', worker: 'Worker',
    official: 'Official', volunteer: 'Volunteer',
    your_location: 'Your Location', your_name: 'Your full name',
    continue: 'Continue', back: 'Back',
    phone_verify: 'Verify Your Account',
    enter_phone: '10-digit phone number',
    send_otp: 'Send OTP', verify_otp: 'Verify & Enter',
    otp_sent: 'OTP sent to',
    enter_otp: 'Enter 6-digit OTP',
    google_signin: 'Continue with Google',
    location_detected: 'Location Detected',
    detecting: 'Detecting your location...',
    allow_location: 'Please allow location access',
    location_denied: 'Location access denied',
    try_again: 'Try Again', enter_manual: 'Enter Manually',
    state: 'State', district: 'District',
    village_area: 'Village / Town / Area', ward_no: 'Ward Number (optional)',
  },
  hi: {
    nav_home: 'होम', nav_map: 'लाइव मैप', nav_community: 'समुदाय चैट',
    nav_ai: 'AI सहायक', nav_profile: 'प्रोफाइल', nav_workers: 'कामगार बाजार',
    nav_emergency: 'आपातकालीन अलर्ट', nav_officials: 'अधिकारी निर्देशिका',
    greeting_morning: 'सुप्रभात', greeting_afternoon: 'नमस्कार',
    greeting_evening: 'शुभ संध्या', greeting_night: 'शुभ रात्रि',
    critical_issues: 'गंभीर समस्याएं', community_updates: 'समुदाय अपडेट',
    workers_nearby: 'पास के कामगार', ai_alerts: 'AI अलर्ट',
    view_all: 'सभी देखें', no_issues: 'आपके क्षेत्र में कोई समस्या नहीं',
    report_issue: 'समस्या रिपोर्ट करें', upload_photo: 'फोटो अपलोड करें',
    take_photo: 'फोटो लें या अपलोड करें', voice_note: 'वॉइस नोट',
    add_description: 'विवरण जोड़ें...', detect_location: 'स्थान पहचानें',
    enter_manually: 'मैन्युअल दर्ज करें', analyze_ai: 'AI से विश्लेषण करें',
    analyzing: 'विश्लेषण हो रहा है...', detecting_hazard: 'खतरे का प्रकार पहचाना जा रहा है...',
    calculating_risk: 'जोखिम स्कोर की गणना हो रही है...', finding_authority: 'प्राधिकरण खोजा जा रहा है...',
    download_pdf: 'PDF रिपोर्ट डाउनलोड करें', share_community: 'समुदाय से साझा करें',
    submit_issue: 'समस्या जमा करें', issue_submitted: 'समस्या सफलतापूर्वक रिपोर्ट की गई!',
    severity_green: 'मामूली', severity_yellow: 'ध्यान चाहिए',
    severity_orange: 'तत्काल', severity_red: 'खतरनाक',
    general: 'सामान्य', emergency_ch: 'आपातकाल', workers_ch: 'कामगार',
    announcements: 'घोषणाएं', agriculture: 'कृषि',
    type_message: 'संदेश टाइप करें...', send: 'भेजें',
    live_room: 'लाइव रूम', hold_to_speak: 'बोलने के लिए दबाएं',
    speaking: 'बोल रहे हैं...', join_broadcast: 'प्रसारण में शामिल हों',
    leave_room: 'रूम छोड़ें', in_room: 'रूम में',
    voice_message: 'वॉइस संदेश', record_voice: 'आवाज रिकॉर्ड करें',
    stop_recording: 'रोकें', cancel: 'रद्द करें',
    find_workers: 'कामगार खोजें', post_job: 'काम पोस्ट करें',
    my_posts: 'मेरे पोस्ट', search_skill: 'कौशल से खोजें...',
    hire: 'काम पर रखें', apply: 'आवेदन करें',
    available: 'उपलब्ध', unavailable: 'अनुपलब्ध',
    per_day: '/दिन', years_exp: 'वर्ष का अनुभव',
    emergency_title: 'आपातकालीन अलर्ट',
    emergency_subtitle: 'आपका अलर्ट तुरंत सभी सदस्यों तक पहुंचेगा',
    fire: 'आग', accident: 'दुर्घटना', medical: 'चिकित्सा',
    crime: 'अपराध', flood: 'बाढ़', electric: 'बिजली खतरा',
    send_alert: 'आपातकालीन अलर्ट भेजें', alert_sent: 'अलर्ट भेजा गया!',
    ai_title: 'AI सहायक', ai_subtitle: 'नागरिक समस्याओं के बारे में पूछें',
    ai_placeholder: 'प्रश्न पूछें...', ai_thinking: 'सोच रहा है...',
    suggested_1: 'स्कूल के पास पानी ओवरफ्लो हो रहा है',
    suggested_2: 'बिजली की समस्या कौन संभालता है?',
    suggested_3: '3 दिनों से कूड़ा नहीं उठाया गया',
    suggested_4: 'गड्ढे की रिपोर्ट कैसे करें?',
    profile_title: 'प्रोफाइल', dark_mode: 'डार्क मोड', light_mode: 'लाइट मोड',
    language: 'भाषा', logout: 'लॉग आउट', save: 'सेव करें', saved: 'सेव हो गया!',
    officials_title: 'अधिकारी निर्देशिका', call: 'कॉल करें', email: 'ईमेल',
    select_language: 'अपनी भाषा चुनें', i_am_a: 'मैं हूँ...',
    citizen: 'नागरिक', worker: 'कामगार', official: 'अधिकारी', volunteer: 'स्वयंसेवक',
    your_location: 'आपका स्थान', your_name: 'आपका पूरा नाम',
    continue: 'जारी रखें', back: 'वापस',
    phone_verify: 'अपना खाता सत्यापित करें',
    send_otp: 'OTP भेजें', verify_otp: 'सत्यापित करें',
    google_signin: 'Google से जारी रखें',
    detecting: 'स्थान पहचाना जा रहा है...',
    location_denied: 'स्थान पहुंच अस्वीकृत',
    try_again: 'पुनः प्रयास करें', enter_manual: 'मैन्युअल दर्ज करें',
    state: 'राज्य', district: 'जिला', village_area: 'गांव / शहर / क्षेत्र',
  },
  kn: {
    nav_home: 'ಮನೆ', nav_map: 'ನಕ್ಷೆ', nav_community: 'ಸಮುದಾಯ',
    nav_ai: 'AI ಸಹಾಯಕ', nav_profile: 'ಪ್ರೊಫೈಲ್', nav_workers: 'ಕೆಲಸಗಾರರು',
    nav_emergency: 'ತುರ್ತು', nav_officials: 'ಅಧಿಕಾರಿಗಳು',
    greeting_morning: 'ಶುಭೋದಯ', greeting_afternoon: 'ನಮಸ್ಕಾರ',
    greeting_evening: 'ಶುಭ ಸಂಜೆ', greeting_night: 'ಶುಭ ರಾತ್ರಿ',
    report_issue: 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ', upload_photo: 'ಫೋಟೋ ಅಪ್ಲೋಡ್',
    analyze_ai: 'AI ನಿಂದ ವಿಶ್ಲೇಷಿಸಿ', submit_issue: 'ಸಲ್ಲಿಸಿ',
    send: 'ಕಳುಹಿಸಿ', cancel: 'ರದ್ದುಮಾಡಿ', hire: 'ನೇಮಕ',
    fire: 'ಬೆಂಕಿ', flood: 'ಪ್ರವಾಹ', call: 'ಕರೆ', save: 'ಉಳಿಸಿ',
    continue: 'ಮುಂದುവರಿಸಿ', back: 'ಹಿಂದೆ', logout: 'ಲಾಗ್ ಔಟ್',
    citizen: 'ನಾಗರಿಕ', worker: 'ಕೆಲಸಗಾರ', official: 'ಅಧಿಕಾರಿ', volunteer: 'ಸ್ವಯಂಸేవಕ',
  },
  ta: {
    nav_home: 'முகப்பு', nav_map: 'வரைபடம்', nav_community: 'சமூகம்',
    nav_ai: 'AI உதவியாளர்', nav_profile: 'சுயவிவரம்',
    greeting_morning: 'காலை வணக்கம்', greeting_afternoon: 'மதிய வணக்கம்',
    report_issue: 'சிக்கல் புகார்', send: 'அனுப்பு', cancel: 'ரத்து',
    fire: 'தீ', flood: 'வெள்ளம்', call: 'அழைப்பு', save: 'சேமி',
    continue: 'தொடர்', back: 'பின்', logout: 'வெளியேறு',
    citizen: 'குடிமகன்', worker: 'தொழிலாளி',
  },
  te: {
    nav_home: 'హోమ్', nav_map: 'మ్యాప్', nav_community: 'సమాజం',
    greeting_morning: 'శుభోదయం', greeting_afternoon: 'నమస్కారం',
    report_issue: 'సమస్య నివేదించు', send: 'పంపు', cancel: 'రద్దు',
    fire: 'అగ్ని', flood: 'వరద', call: 'కాల్', save: 'సేవ్',
    continue: 'కొనసాగించు', logout: 'లాగ్ అవుట్',
    citizen: 'పౌరుడు', worker: 'కార్మికుడు',
  },
  ml: {
    nav_home: 'ഹോം', nav_map: 'മാപ്പ്', nav_community: 'കമ്മ്യൂണിറ്റി',
    greeting_morning: 'സുപ്രഭാതം', greeting_afternoon: 'നമസ്കാരം',
    report_issue: 'പ്രശ്നം റിപ്പോർട്ട്', send: 'അയയ്ക്കുക',
    fire: 'തീ', flood: 'വെള്ളപ്പൊക്കം', call: 'കോൾ', save: 'സേവ്',
    continue: 'തുടരുക', logout: 'ലോഗ് ഔട്ട്',
    citizen: 'പൗരൻ', worker: 'തотൊഴിലാളി',
  },
  bn: {
    nav_home: 'হোম', nav_map: 'মানচিত্র', nav_community: 'সম্প্রদায়',
    greeting_morning: 'शुभ सकाळ', greeting_afternoon: 'শুভ দুপুর',
    report_issue: 'সমস্যা রিপোর্ট', send: 'পাঠান', cancel: 'বাতিল',
    fire: 'আগুন', flood: 'বন্যা', call: 'কল', save: 'সংরक्षण',
    continue: 'চালিয়ে যান', logout: 'লগ আউট',
    citizen: 'নাগরিক', worker: 'শ্রমিক',
  },
  mr: {
    nav_home: 'होम', nav_map: 'नकाशा', nav_community: 'समुदाय',
    greeting_morning: 'शुभ प्रभात', greeting_afternoon: 'नमस्कार',
    report_issue: 'समस्या नोंदवा', send: 'पाठवा', cancel: 'रद्द करा',
    fire: 'आग', flood: 'पूर', call: 'कॉल', save: 'जतन करा',
    continue: 'पुढे चला', logout: 'बाहेर पडा',
    citizen: 'नागरिक', worker: 'कामगार',
  },
  gu: {
    nav_home: 'હોમ', nav_map: 'નકશો', nav_community: 'સમુદાય',
    greeting_morning: 'સુપ્રભાત', greeting_afternoon: 'નમસ્તે',
    report_issue: 'સમસ્યા નોંધો', send: 'મોકલો', cancel: 'રદ કરો',
    fire: 'આગ', flood: 'પૂર', call: 'કૉલ', save: 'સેવ કરો',
    continue: 'આગળ વધો', logout: 'લૉગ આઉટ',
    citizen: 'નાગરિક', worker: 'કામદાર',
  },
  pa: {
    nav_home: 'ਹੋਮ', nav_map: 'ਨਕਸ਼ਾ', nav_community: 'ਭਾਈਚਾਰਾ',
    greeting_morning: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', greeting_afternoon: 'ਨਮਸਕਾਰ',
    report_issue: 'ਸਮੱਸਿਆ ਰਿਪੋਰਟ', send: 'ਭੇਜੋ', cancel: 'ਰੱਦ ਕਰੋ',
    fire: 'ਅੱਗ', flood: 'ਹੜ੍ਹ', call: 'ਕਾਲ', save: 'ਸੇવ ਕਰੋ',
    continue: 'ਜਾਰੀ ਰੱਖੋ', logout: 'ਲੌਗ ਆਊਟ',
    citizen: 'ਨਾਗਰਿਕ', worker: 'ਕਾਮਾ',
  }
}

// Add English as fallback for all missing keys
Object.keys(translations).forEach(lang => {
  if (lang !== 'en') {
    translations[lang] = { ...translations.en, ...translations[lang] }
  }
})

const resources = {}
Object.keys(translations).forEach(lang => {
  resources[lang] = { translation: translations[lang] }
})

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('vanguard_language') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false }
})

export default i18n
export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang)
  localStorage.setItem('vanguard_language', lang)
}
