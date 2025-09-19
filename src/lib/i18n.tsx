"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type LanguageCode = "ml" | "en" | "hi";

type Dictionary = Record<string, { ml: string; en: string; hi?: string }>;

const dictionary: Dictionary = {
  appTitle: {
    ml: "ഡിജിറ്റൽ കൃഷി ഓഫീസർ",
    en: "Digital Krishi Officer",
    hi: "डिजिटल कृषि अधिकारी",
  },
  offline: { ml: "ഓഫ്‌ലൈൻ", en: "Offline", hi: "ऑफ़लाइन" },

  // QueryComposer
  input_text: { ml: "ടെക്സ്റ്റ്", en: "Text", hi: "टेक्स्ट" },
  input_voice: { ml: "വോയ്സ്", en: "Voice", hi: "वॉइस" },
  placeholder_question: {
    ml: "വാഴയിൽ ഇലപ്പുള്ളി എന്ത് കീടനാശിനി ഉപയോഗിക്കാം?",
    en: "What pesticide should I use for leaf spot in banana?",
    hi: "केले में लीफ स्पॉട के लिए कौन सा कीटनाशक उपयोग करें?",
  },
  chip_pest_control: { ml: "കീടനാശിനി ശുപാര്‍ശ", en: "Pest Control", hi: "कीटनाशक सलाह" },
  chip_fertilizer: { ml: "വളം ശുപാര്‍ശ", en: "Fertilizer", hi: "उर्वरक सलाह" },
  chip_weather: { ml: "കാലാവസ്ഥ ഉപദേശം", en: "Weather Advice", hi: "मौसम सलाह" },
  chip_subsidy: { ml: "സബ്സിഡി വിവരങ്ങൾ", en: "Subsidy Info", hi: "सब्सिडी जानकारी" },

  recording_save: { ml: "സേവ് ചെയ്യുക", en: "Save", hi: "सेव करें" },
  recording_cancel: { ml: "റദ്ദാക്കുക", en: "Cancel", hi: "रद्द करें" },
  recording_done: { ml: "റെക്കോർഡിംഗ് പൂർത്തിയായി", en: "Recording complete", hi: "रिकॉर्डिंग पूरी हुई" },
  transcribing: { ml: "ട്രാൻസ്ക്രിപ്ഷൻ ചെയ്യുന്നു...", en: "Transcribing...", hi: "ट्रांസक्राइब हो रहा है..." },
  transcription_placeholder: { ml: "ട്രാൻസ്ക്രിപ്ഷൻ എഡിറ്റ് ചെയ്യുക...", en: "Edit transcription...", hi: "ट्रांസक्रिप्शन संपादित करें..." },

  images: { ml: "ചിത്രങ്ങൾ", en: "Images", hi: "चित्र" },
  add: { ml: "ചേർക്കുക", en: "Add", hi: "जोड़ें" },
  uploaded_image_alt: { ml: "അപ്‌ലോഡ് ചെയ്ത ചിത്രം", en: "Uploaded image", hi: "अपलोड की गई छवि" },

  crop: { ml: "വിള", en: "Crop", hi: "फसल" },
  crop_placeholder: { ml: "വിള തിരഞ്ഞെടുക്കുക", en: "Select crop", hi: "फसल चुनें" },
  season: { ml: "സീസൺ", en: "Season", hi: "मौसम" },
  season_placeholder: { ml: "സീസൺ തിരഞ്ഞെടുക്കുക", en: "Select season", hi: "मौसम चुनें" },

  crop_banana: { ml: "വാഴ", en: "Banana", hi: "केला" },
  crop_rice: { ml: "നെല്ല്", en: "Rice", hi: "धान" },
  crop_cocoa: { ml: "കൊക്കോ", en: "Cocoa", hi: "कोको" },
  crop_pepper: { ml: "കുരുമുളക്", en: "Pepper", hi: "काली मिर्च" },
  crop_other: { ml: "മറ്റുള്ളവ", en: "Other", hi: "अन्य" },

  season_sowing: { ml: "വിത്ത് വിതയ്ക്കൽ", en: "Sowing", hi: "बोवाई" },
  season_growing: { ml: "വളർത്തൽ", en: "Growing", hi: "विकास" },
  season_harvest: { ml: "വിളവെടുപ്പ്", en: "Harvest", hi: "कटाई" },
  season_fallow: { ml: "വിശ്രമം", en: "Fallow", hi: "परती" },

  auto_locate: { ml: "സ്വയമേവ സ്ഥാനം കണ്ടെത്തുക", en: "Detect location automatically", hi: "स्थान स्वतः पहचानें" },
  location_placeholder: { ml: "സ്ഥാനം നൽകുക", en: "Enter location", hi: "स्थान दर्ज करें" },

  problem_desc_label: { ml: "പ്രശ്ന വിവരണം (ഓപ്ഷണൽ)", en: "Problem description (optional)", hi: "समस्या विवरण (वैकल्पिक)" },
  problem_desc_placeholder: { ml: "പ്രശ്നത്തെക്കുറിച്ച് കൂടുതൽ വിവരങ്ങൾ...", en: "More details about the problem...", hi: "समस्या के बारे में और विवरण..." },

  consent_text: {
    ml: "ചിത്രങ്ങളും സ്ഥാന വിവരങ്ങളും പങ്കിടാൻ ഞാൻ സമ്മതിക്കുന്നു. ഡാറ്റ കൃഷി ഉപദേശത്തിനായി മാത്രം ഉപയോഗിക്കും.",
    en: "I consent to sharing images and location. Data will be used only for agricultural advice.",
    hi: "मैं छवियां और स्थान साझा करने के लिए सहमत हूं। डेटा केवल कृषि सलाह के लिए उपयोग होगा।",
  },

  uploading: { ml: "അപ്‌ലോഡ് ചെയ്യുന്നു...", en: "Uploading...", hi: "अपलोड हो रहा है..." },
  submit: { ml: "ചോദ്യം സമർപ്പിക്കുക", en: "Submit Query", hi: "प्रश्न सबमिट करें" },
  submitting: { ml: "സമർപ്പിക്കുന്നു...", en: "Submitting...", hi: "सबमिट हो रहा है..." },

  // Toasts / errors
  err_mic: { ml: "മൈക്രോഫോൺ ആക്സസ് ചെയ്യാൻ കഴിയുന്നില്ല", en: "Unable to access microphone", hi: "माइक्रोफोन तक पहुंच नहीं" },
  warn_offline_queue: {
    ml: "ഇന്റർനെറ്റ് കണക്ഷൻ ലഭ്യമല്ല. ചോദ്യം ക്യൂവിൽ ചേർക്കും",
    en: "No internet connection. Your query will be queued.",
    hi: "इंटरनेट कनेक्शन नहीं है। आपका प्रश्न कतार में जोड़ा जाएगा।",
  },
  err_enter_content: {
    ml: "ദയവായി ഒരു ചോദ്യം ടൈപ്പ് ചെയ്യുക, ചിത്രം അപ്‌ലോഡ് ചെയ്യുക അല്ലെങ്കിൽ വോയ്‌സ് റെക്കോർഡ് ചെയ്യുക",
    en: "Please type a question, upload an image, or record voice",
    hi: "कृपया प्रश्न लिखें, छवि अपलोड करें या वॉयस रिकॉर्ड करें",
  },
  err_consent: {
    ml: "ദയവായി ഡാറ്റ പങ്കിടലിന് സമ്മതം നൽകുക",
    en: "Please provide consent for data sharing",
    hi: "कृपया डेटा साझा करने की सहमति दें",
  },
  toast_success: { ml: "ചോദ്യം വിജയകരമായി സമർപ്പിച്ചു", en: "Query submitted successfully", hi: "प्रश्न सफलतापूर्वक सबमिट हुआ" },
  toast_fail: {
    ml: "സമർപ്പിക്കുന്നതിൽ പരാജയപ്പെട്ടു. വീണ്ടും ശ്രമിക്കുക",
    en: "Submission failed. Please try again",
    hi: "सबमिशन विफल। कृपया पुनः प्रयास करें",
  },

  // AnswerFeed
  status_ai_replied: { ml: "AI മറുപടി", en: "AI replied", hi: "AI ने उत्तर दिया" },
  status_clarifying: { ml: "വ്യക്തത ആവശ്യം", en: "Clarification needed", hi: "स्पष्टीकरण आवश्यक" },
  status_escalated: { ml: "എസ്‌കലേറ്റ് ചെയ്തു", en: "Escalated", hi: "एस्केलेट किया गया" },
  status_resolved: { ml: "പരിഹരിച്ചു", en: "Resolved", hi: "सुलझाया गया" },
  conf_high: { ml: "വളരെ ഉറപ്പ്", en: "Highly confident", hi: "उच्च विश्वास" },
  conf_medium: { ml: "സാധാരണ ഉറപ്പ്", en: "Moderately confident", hi: "मध्यम विश्वास" },
  conf_low: { ml: "ഓഫീസറെ സമീപിക്കാൻ നിർദേശിക്കുന്നു", en: "Suggest verify with officer", hi: "अधिकारी से सत्यापित करें" },
  ai_answer: { ml: "AI മറുപടി", en: "AI Answer", hi: "AI उत्तर" },
  steps_title: { ml: "പ്രവർത്തന നിർദ്ദേശങ്ങൾ:", en: "Action steps:", hi: "कार्रवाई के चरण:" },
  dos_title: { ml: "✅ ചെയ്യേണ്ടത്:", en: "✅ Do's:", hi: "✅ क्या करें:" },
  donts_title: { ml: "❌ ചെയ്യരുത്:", en: "❌ Don'ts:", hi: "❌ क्या न करें:" },
  sources_evidence: { ml: "സ്രോതസ്സുകളും തെളിവുകളും", en: "Sources & Evidence", hi: "स्रोत और प्रमाण" },
  source_advisory: { ml: "ഉപദേശം", en: "Advisory", hi: "सलाह" },
  source_weather: { ml: "കാലാവസ്ഥ", en: "Weather", hi: "मौसम" },
  source_guideline: { ml: "മാർഗനിർദ്ദേശം", en: "Guideline", hi: "दिशानिर्देश" },
  follow_up: { ml: "ഫോളോ-അപ്പ്", en: "Follow-up", hi: "फॉलो-अप" },
  ask_clarification: { ml: "വ്യക്തത ചോദിക്കുക", en: "Ask for clarification", hi: "स्पष्टीकरण पूछें" },
  save: { ml: "സേവ് ചെയ്യുക", en: "Save", hi: "सेव करें" },
  escalate: { ml: "എസ്‌കലേറ്റ് ചെയ്യുക", en: "Escalate", hi: "एस्केलेट करें" },
  escalate_title: { ml: "അഗ്രി ഓഫീസറിലേക്ക് എസ്‌കലേറ്റ് ചെയ്യുക", en: "Escalate to Agri Officer", hi: "कृषि अधिकारी को एस्केलेट करें" },
  recipient: { ml: "സ്വീകർത്താവ്", en: "Recipient", hi: "प्राप्तकर्ता" },
  recipient_officer: { ml: "അഗ്രി ഓഫീസർ", en: "Agri Officer", hi: "कृषि अधिकारी" },
  recipient_krishibhavan: { ml: "കൃഷിഭവൻ", en: "Krishibhavan", hi: "कृषिभवन" },
  priority: { ml: "പ്രാധാന്യം", en: "Priority", hi: "प्राथमिकता" },
  low: { ml: "കുറഞ്ഞത്", en: "Low", hi: "निम्न" },
  medium: { ml: "ഇടത്തരം", en: "Medium", hi: "मध्यम" },
  high: { ml: "ഉയർന്നത്", en: "High", hi: "उच्च" },
  urgent: { ml: "അടിയന്തിരം", en: "Urgent", hi: "तत्काल" },
  notes: { ml: "കുറിപ്പുകൾ", en: "Notes", hi: "नोट्स" },
  notes_placeholder: { ml: "കൂടുതൽ വിവരങ്ങൾ ചേർക്കുക...", en: "Add more details...", hi: "अधिक विवरण जोड़ें..." },
  cancel: { ml: "റദ്ദാക്കുക", en: "Cancel", hi: "रद्द करें" },
  send: { ml: "അയക്കുക", en: "Send", hi: "भेजें" },
  followup_placeholder: { ml: "ഫോളോ-അപ്പ് ചോദ്യം ടൈപ്പ് ചെയ്യുക...", en: "Type a follow-up question...", hi: "फॉलो-अप प्रश्न लिखें..." },
  no_questions_title: { ml: "ചോദ്യങ്ങളൊന്നുമില്ല", en: "No questions yet", hi: "अभी तक कोई प्रश्न नहीं" },
  no_questions_desc: { ml: "നിങ്ങളുടെ കാർഷിക ചോദ്യങ്ങൾ ഇവിടെ കാണിക്കും", en: "Your agricultural questions will appear here", hi: "आपके कृषि संबंधी प्रश्न यहाँ दिखाई देंगे" },
  tips_line1: { ml: "💡 നുറുങ്ങുകൾ: വിളകളുടെ രോഗങ്ങൾ, കീടങ്ങൾ, വളം എന്നിവയെ കുറിച്ച് ചോദിക്കുക", en: "Tips: ask about crop diseases, pests, and fertilizers", hi: "टिप्स: फसल रोग, कीट और उर्वरक के बारे में पूछें" },
  tips_line2: { ml: "📸 ഫോട്ടോകൾ അറ്റാച്ച് ചെയ്ത് മികച്ച ഉത്തരങ്ങൾ ലഭിക്കുക", en: "Attach photos for better answers", hi: "बेहतर उत्तരों के लिए फोटो संलग्न करें" },
  followup_sent_toast: { ml: "ഫോളോ-അപ്പ് ചോദ്യം അയച്ചു", en: "Follow-up question sent", hi: "फॉलो-अप प्रश्न भेजा गया" },
  feedback_thanks_toast: { ml: "നന്ദി! ഫീഡ്‌ബാക്ക് രേഖപ്പെടുത്തി", en: "Thank you! Feedback recorded", hi: "धन्यवाद! फीडबैक दर्ज किया गया" },
  feedback_recorded_toast: { ml: "ഫീഡ്‌ബാക്ക് രേഖപ്പെടുത്തി", en: "Feedback recorded", hi: "फीडबैक दर्ज" },
  fill_all_details_error: { ml: "ദയവായി എല്ലാ വിവരങ്ങളും പൂരിപ്പിക്കുക", en: "Please fill all details", hi: "कृपया सभी विवरण भरें" },
  escalate_success_toast: { ml: "അഗ്രി ഓഫീസറിലേക്ക് എസ്‌കലേറ്റ് ചെയ്തു", en: "Escalated to Agri Officer", hi: "कृषि अधिकारी को एस्केलेट किया गया" },
  saved_to_notebook_toast: { ml: "നോട്ട്ബുക്കിലേക്ക് സേവ് ചെയ്തു", en: "Saved to notebook", hi: "नोटबुक में सहेजा गया" },

  // FarmerSidebar
  edit_profile: { ml: "പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യൂ", en: "Edit profile", hi: "प्रोफाइल संपादित करें" },
  update_info: { ml: "നിങ്ങളുടെ വിവരങ്ങൾ അപ്‌ഡേറ്റ് ചെയ്യൂ", en: "Update your information", hi: "अपनी जानकारी अपडेट करें" },
  name: { ml: "പേര്", en: "Name", hi: "नाम" },
  location_label: { ml: "സ്ഥലം", en: "Location", hi: "स्थान" },
  phone: { ml: "ഫോൺ നമ്പർ", en: "Phone number", hi: "फोन नंबर" },
  save_btn: { ml: "സേവ് ചെയ്യൂ", en: "Save", hi: "सेव करें" },
  plots: { ml: "കൃഷിയിടങ്ങൾ", en: "Farms/Plots", hi: "खेत/प्लॉट" },
  add: { ml: "ചേർക്കൂ", en: "Add", hi: "जोड़ें" },
  add_new_plot: { ml: "പുതിയ കൃഷിയിടം ചേർക്കൂ", en: "Add new plot", hi: "नया प्लॉട जोड़ें" },
  plot_name: { ml: "കൃഷിയിടത്തിന്റെ പേര്", en: "Plot name", hi: "प्लॉट का नाम" },
  crops_label: { ml: "വിളകൾ", en: "Crops", hi: "फसलें" },
  soil_type: { ml: "മണ്ണിന്റെ തരം", en: "Soil type", hi: "मिट्टी का प्रकार" },
  select_soil_type: { ml: "മണ്ണിന്റെ തരം തിരഞ്ഞെടുക്കൂ", en: "Select soil type", hi: "मिट्टी का प्रकार चुनें" },
  clay: { ml: "കളിമണ്ണ്", en: "Clay", hi: "चिकनी मिट्टी" },
  sandy: { ml: "മണൽമണ്ണ്", en: "Sandy", hi: "बलुई मिट्टी" },
  loamy: { ml: "കരിമണ്ണ്", en: "Loamy", hi: "दोमट" },
  area: { ml: "വിസ്തീർണ്ണം", en: "Area", hi: "क्षेत्रफल" },
  add_btn: { ml: "ചേർക്കൂ", en: "Add", hi: "जोड़ें" },
  no_plots: { ml: "കൃഷിയിടങ്ങൾ ഇല്ല", en: "No plots", hi: "कोई प्लॉट नहीं" },
  add_first_plot: { ml: "ആദ്യത്തെ കൃഷിയിടം ചേർക്കൂ", en: "Add your first plot", hi: "अपना पहला प्लॉട जोड़ें" },
  favorite_crops: { ml: "പ്രിയപ്പെട്ട വിളകൾ", en: "Favorite crops", hi: "पसंदीदा फसलें" },
  recent_questions: { ml: "സമീപകാല ചോദ്യങ്ങൾ", en: "Recent questions", hi: "हाल के प्रश्न" },
  help: { ml: "സഹായം", en: "Help", hi: "मदद" },
  hotline: { ml: "സഹായ ഹോട്ട്‌ലൈൻ", en: "Help hotline", hi: "हेल्प हॉटलाइन" },
  sms_help: { ml: "SMS സഹായം", en: "SMS help", hi: "SMS सहायता" },
  field_visit: { ml: "വയൽ സന്ദർശനം", en: "Field visit", hi: "क्षेत्र भ्रमण" },
  krishibhavan_label: { ml: "കൃഷിഭവൻ", en: "Krishibhavan", hi: "कृषिभवन" },
  help_tips_title: { ml: "സഹായ നിർദ്ദേശങ്ങൾ", en: "Help tips", hi: "मदद सुझाव" },
  help_tip1: { ml: "• വ്യക്തമായ ചോദ്യങ്ങൾ ചോദിക്കൂ", en: "• Ask clear questions", hi: "• स्पष्ट प्रश्न पूछें" },
  help_tip2: { ml: "• പ്രശ്നത്തിന്റെ ഫോട്ടോ അറ്റാച്ച് ചെയ്യൂ", en: "• Attach a photo of the issue", hi: "• समस्या की फोटो संलग्न करें" },
  help_tip3: { ml: "• നിങ്ങളുടെ സ്ഥലവും വിളയും പറയൂ", en: "• Mention your location and crop", hi: "• अपना स्थान और फसल बताएं" },
  help_tip4: { ml: "• വോയ്സ് നോട്ട് അയയ്ക്കാൻ മടിക്കരുത്", en: "• Feel free to send a voice note", hi: "• वॉयस नोट भेजने में संकोच न करें" },
  last_synced: { ml: "അവസാനം സിങ്ക് ചെയ്തത്:", en: "Last synced:", hi: "अंतिम सिंक:" },
  logout: { ml: "ലോഗ് ഔട്ട്", en: "Log out", hi: "लॉग आउट" },
  // Added: FarmerSidebar status labels
  sidebar_status_answered: { ml: "ഉത്തരം ലഭിച്ചു", en: "Answered", hi: "उत्तര मिला" },
  sidebar_status_pending: { ml: "കാത്തിരിക്കുന്നു", en: "Pending", hi: "लंबित" },
  sidebar_status_escalated: { ml: "വിശദീകരിച്ചു", en: "Escalated", hi: "एस्केलेट किया" },

  // ContextPanel
  context_panel_title: { ml: "കോണ്റ്റെക്സ്റ്റ് പാനൽ", en: "Context Panel", hi: "संदर्भ पैनल" },
  refresh: { ml: "പുതുക്കുക", en: "Refresh", hi: "रीफ़्रेश" },
  offline_banner: { ml: "ഡാറ്റ പഴകിയതാകാം. കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും പുതുക്കുക.", en: "Data may be outdated. Check your connection and refresh.", hi: "डेटा पुराना हो सकता है। कनेक्शन जांचें और रीफ़्रेश करें।" },
  local_weather: { ml: "പ്രാദേശിക കാലാവസ്ഥ", en: "Local Weather", hi: "स्थानीय मौसम" },
  rain_label: { ml: "മഴ", en: "Rain", hi: "वर्षा" },
  weather_unavailable: { ml: "കാലാവസ്ഥാ ഡാറ്റ ലഭ്യമല്ല", en: "Weather data unavailable", hi: "मौसम डेटा उपलब्ध नहीं" },
  pest_alerts_title: { ml: "സജീവമായ കീട/രോഗ മുന്നറിയിപ്പ്", en: "Active Pest & Disease Alerts", hi: "सक्रिय कीट और रोग अलर्ट" },
  view_source: { ml: "സ്രോതസ് കാണുക", en: "View Source", hi: "स्रोत देखें" },
  no_active_alerts: { ml: "സജീവ മുന്നറിയിപ്പുകളൊന്നുമില്ല", en: "No active alerts", hi: "कोई सक्रिय अलर्ट नहीं" },
  crop_calendar: { ml: "വിള കലണ്ടർ", en: "Crop Calendar", hi: "फसल कैलेंडर" },
  urgent_badge: { ml: "അടിയന്തിരം", en: "Urgent", hi: "तत्काल" },
  season_progress_suffix: { ml: "സീസൺ പൂർത്തിയായി", en: "of season complete", hi: "सीज़न पूरा" },
  no_scheduled_activities: { ml: "ഷെഡ്യൂൾ ചെയ്ത പ്രവർത്തനങ്ങളൊന്നുമില്ല", en: "No scheduled activities", hi: "कोई निर्धारित गतिविधि नहीं" },
  schemes_title: { ml: "നിലവിലുള്ള പദ്ധതികളും സബ്സിഡികളും", en: "Current Schemes & Subsidies", hi: "वर्तमान योजनाएँ और सब्सिडी" },
  deadline_label: { ml: "അവസാന തീയതി:", en: "Deadline:", hi: "अंतिम तिथि:" },
  for_label: { ml: "ആർക്കാണ്:", en: "For:", hi: "के लिए:" },
  more_info: { ml: "കൂടുതൽ വിവരം", en: "More Info", hi: "अधिक जानकारी" },
  apply: { ml: "അപ്ലൈ ചെയ്യുക", en: "Apply", hi: "आवेदन करें" },
  extension_office: { ml: "എക്സ്റ്റൻഷൻ ഓഫീസ്", en: "Extension Office", hi: "विस्तार कार्यालय" },
  hours_label: { ml: "സമയം:", en: "Hours:", hi: "समय:" },
  next_available: { ml: "അടുത്ത ലഭ്യം:", en: "Next Available:", hi: "अगला उपलब्ध:" },
  schedule_visit: { ml: "സന്ദർശനം ഷെഡ്യൂൾ ചെയ്യുക", en: "Schedule Visit", hi: "भेंट अनुसूचित करें" },
  office_info_unavailable: { ml: "ഓഫീസ് വിവരങ്ങൾ ലഭ്യമല്ല", en: "Office information unavailable", hi: "कार्यालय जानकारी उपलब्ध नहीं" },
  no_applicable_schemes: { ml: "പ്രയോഗിക്കാവുന്ന പദ്ധതികളൊന്നുമില്ല", en: "No applicable schemes", hi: "कोई लागू योजनाएँ नहीं" },
};

interface I18nContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof typeof dictionary) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("ml");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("app_language") as LanguageCode)) || null;
    if (saved) setLanguageState(saved);
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("app_language", lang);
      try {
        const html = document.documentElement;
        html.setAttribute("lang", lang);
      } catch {}
    }
  };

  const t: I18nContextValue["t"] = (key) => {
    const entry = dictionary[key];
    if (!entry) return key as string;
    return entry[language] || entry.en || Object.values(entry)[0];
  };

  const value = useMemo(() => ({ language, setLanguage, t }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}