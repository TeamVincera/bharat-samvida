export type Locale = 'en' | 'hi';

export const translations = {
  en: {
    brand: 'Bharat Samvida',
    tagline: 'Clarity in every tender.',
    sihNotice: 'An independent SIH project concept. Recommendations require review by the procuring authority.',
    nav: {
      home: 'Home',
      studio: 'Tender Studio',
      library: 'Legal Library',
      privacy: 'Privacy',
      accessibility: 'Accessibility',
      sources: 'Corpus & Sources'
    },
    home: {
      heroEyebrow: '01 / Places to learn',
      heroTitle: 'A stronger India starts with a clearer tender.',
      heroSubtitle: 'Describe what your community needs. Find the standards that help you specify it well.',
      startCTA: 'Start a tender',
      exploreCTA: 'Explore the transformation',
      scrollCue: 'SCROLL TO BUILD',
      chapters: [
        {
          id: 'school',
          number: '01',
          eyebrow: '01 / Places to learn',
          title: 'A school prepared for tomorrow',
          stages: [
            {
              title: 'A stronger India starts with a clearer tender.',
              body: 'Describe what your community needs. Find the standards that help you specify it well.'
            },
            {
              title: 'Better classrooms begin in the specification.',
              body: 'Paint, furniture and classroom equipment each bring different requirements. A useful tender makes them explicit.'
            },
            {
              title: 'Specify quality. Make room for possibility.',
              body: 'Bharat Samvida connects your requirement with relevant Indian Standards and the evidence to review them.'
            }
          ],
          cta: 'Plan a school upgrade'
        },
        {
          id: 'neighbourhood',
          number: '02',
          eyebrow: '02 / Places to belong',
          title: 'Neighbourhoods with room to thrive',
          stages: [
            {
              title: 'Development should improve everyday life.',
              body: 'Homes depend on more than walls: water, drainage, safe wiring and shared spaces matter too.'
            },
            {
              title: 'See the requirements around the requirement.',
              body: 'Find related product, test, safety and installation standards that a brief can overlook.'
            },
            {
              title: 'Build for communities, detail by detail.',
              body: 'Turn a broad intention into a specification that reviewers and suppliers can understand.'
            }
          ],
          cta: 'Explore a housing brief'
        },
        {
          id: 'bridge',
          number: '03',
          eyebrow: '03 / Places to connect',
          title: 'Connecting two banks',
          stages: [
            {
              title: 'A connection begins before the first span.',
              body: 'Infrastructure briefs need clear materials, test requirements and specialist review.'
            },
            {
              title: 'Bring the supporting standards into view.',
              body: 'Trace the references behind a recommendation and check what is current, conditional or still unresolved.'
            },
            {
              title: 'Better specified. Better connected.',
              body: 'Start with a simple description. Build a stronger technical brief.'
            }
          ],
          cta: 'Open Tender Studio'
        }
      ],
      howItWorks: {
        eyebrow: 'How Bharat Samvida works',
        title: 'From your description to an evidence-backed specification.',
        step1Title: 'Describe your need',
        step1Body: 'Enter what you want to procure in everyday language or attach your draft tender document. No standards knowledge required.',
        step2Title: 'Resolve the gaps',
        step2Body: 'Answer four-choice clarifying questions to resolve surfaces, exposures, materials, and safety boundaries.',
        step3Title: 'Review the evidence',
        step3Body: 'Receive primary product standards, allied test methods, certification requirements, and an editable draft specification.'
      },
      finalCTA: {
        title: 'What would you like to build?',
        subtitle: 'Start drafting your procurement specification with verified Indian Standards.',
        studioBtn: 'Launch Tender Studio',
        libraryBtn: 'Browse Legal Library'
      }
    },
    studio: {
      breadcrumbNew: 'Tender Studio / New brief',
      heading: 'What would you like to procure?',
      subheading: 'Write it in your own words. We’ll help you identify missing details and relevant standards.',
      composerPlaceholder: 'Describe your procurement requirement (e.g. Refresh classrooms with wall paint, desks and teaching boards)...',
      charCount: 'characters',
      addDocument: 'Attach document',
      docHint: 'PDF, DOCX or TXT (Max 10MB per file, 20MB total)',
      exampleChips: [
        'Refresh classrooms with wall paint, desks and teaching boards.',
        'Prepare a housing brief for water pipes and internal wiring.',
        'Find standards relevant to concrete and reinforcement for a bridge.'
      ],
      optionalDetailsTitle: 'Optional project details',
      procurementType: 'Procurement Type',
      procuringEntity: 'Procuring Entity Type',
      stateUT: 'State / Union Territory',
      intendedDate: 'Intended Tender Publication Date',
      privacyNote: 'We’ll show the technical details to be shared with the AI. Keep confidential or personal information out of your brief.',
      sessionNotice: 'No account needed. Your draft is temporary. Download it if you want to keep it.',
      reviewBriefBtn: 'Review my brief',
      privacyReviewTitle: 'Privacy review and minimisation',
      privacyReviewDesc: 'Verify detected sensitive entities before analysis. The processor (Groq) only receives approved technical details.',
      redactedBadge: 'Protected Spans',
      detectedEntitiesLabel: 'Detected Identifiers & Sensitive Data',
      proceedToAnalyzeBtn: 'Analyse the shared details',
      backToEditBtn: 'Back to editing',
      loadingStages: [
        'Reading your brief',
        'Finding candidate standards',
        'Checking related references',
        'Preparing your review'
      ],
      takingLonger: 'This is taking a little longer than usual...',
      cancelBtn: 'Cancel analysis',
      clarification: {
        eyebrow: 'Clarification',
        reasonLabel: 'Why this matters:',
        customOption: 'Something else',
        customPlaceholder: 'Describe another surface, material or mixed use...',
        notSureBtn: 'I’m not sure',
        skipBtn: 'Skip for now',
        useAnswerBtn: 'Use this answer',
        questionProgress: 'Question'
      },
      dossier: {
        title: 'Your specification, with evidence.',
        subtitle: 'Review the recommendations and resolve open requirements before tender use.',
        tabs: {
          standards: 'Standards',
          related: 'Related standards',
          certification: 'Gaps & certification',
          draft: 'Draft specification',
          sources: 'Sources'
        },
        actions: {
          copy: 'Copy draft',
          downloadPdf: 'Download PDF',
          downloadDocx: 'Download Word',
          downloadJson: 'Download JSON',
          includeInDraft: 'Include in draft',
          exclude: 'Exclude',
          viewEvidence: 'View evidence'
        },
        reviewChecklistTitle: 'Before you use this draft',
        deleteSessionBtn: 'Delete this session',
        newBriefBtn: 'New brief'
      }
    },
    library: {
      title: 'Legal Library',
      subtitle: 'Verified Indian procurement manuals, BIS Acts, regulations and Quality Control Orders.',
      searchPlaceholder: 'Search by title, standard code (e.g. IS 15489), or issuer...',
      filterAll: 'All Categories',
      filterType: 'Document Type',
      filterAvailability: 'Availability',
      filterYear: 'Year',
      readPdf: 'Read original PDF',
      viewSource: 'Official source',
      downloadPdf: 'Download PDF',
      page: 'Page',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      fitWidth: 'Fit width',
      emptyCategory: 'No verified documents in this category yet. Explore the official portal links.',
      currencyWarning: 'Currency not fully reviewed. Verify with the issuing authority before tender publication.'
    },
    demoNotice: 'Demonstration mode — example recommendations. Live analysis is not configured.'
  },
  hi: {
    brand: 'भारत संविदा',
    tagline: 'हर निविदा में स्पष्टता।',
    sihNotice: 'एक स्वतंत्र SIH परियोजना संकल्पना। सिफारिशों की खरीद प्राधिकरण द्वारा समीक्षा आवश्यक है।',
    nav: {
      home: 'मुख्य पृष्ठ',
      studio: 'निविदा स्टूडियो',
      library: 'कानूनी दस्तावेज़',
      privacy: 'गोपनीयता',
      accessibility: 'सुगमता',
      sources: 'स्रोत एवं संग्रह'
    },
    home: {
      heroEyebrow: '01 / सीखने के स्थान',
      heroTitle: 'एक मजबूत भारत की शुरुआत एक स्पष्ट निविदा से होती है।',
      heroSubtitle: 'बताएं कि आपके समुदाय को क्या चाहिए। वे मानक खोजें जो आपको इसे बेहतर ढंग से निर्दिष्ट करने में मदद करें।',
      startCTA: 'निविदा शुरू करें',
      exploreCTA: 'परिवर्तन देखें',
      scrollCue: 'निर्माण के लिए स्क्रॉल करें',
      chapters: [
        {
          id: 'school',
          number: '01',
          eyebrow: '01 / सीखने के स्थान',
          title: 'कल के लिए तैयार एक विद्यालय',
          stages: [
            {
              title: 'एक मजबूत भारत की शुरुआत एक स्पष्ट निविदा से होती है।',
              body: 'बताएं कि आपके समुदाय को क्या चाहिए। वे मानक खोजें जो आपको इसे बेहतर ढंग से निर्दिष्ट करने में मदद करें।'
            },
            {
              title: 'बेहतर कक्षाओं की शुरुआत विनिर्देश से होती है।',
              body: 'पेंट, फर्नीचर और कक्षा उपकरण प्रत्येक के लिए अलग आवश्यकताएं होती हैं। एक उपयोगी निविदा उन्हें स्पष्ट करती है।'
            },
            {
              title: 'गुणवत्ता निर्दिष्ट करें। संभावनाओं के लिए जगह बनाएं।',
              body: 'भारत संविदा आपकी आवश्यकता को प्रासंगिक भारतीय मानकों और साक्ष्यों से जोड़ता है।'
            }
          ],
          cta: 'विद्यालय उन्नयन की योजना बनाएं'
        },
        {
          id: 'neighbourhood',
          number: '02',
          eyebrow: '02 / अपनेपन के स्थान',
          title: 'सशक्त और सुरक्षित पड़ोस',
          stages: [
            {
              title: 'विकास से दैनिक जीवन में सुधार होना चाहिए।',
              body: 'घर दीवारों से कहीं अधिक पर निर्भर करते हैं: पानी, जल निकासी, सुरक्षित वायरिंग और साझा स्थान भी मायने रखते हैं।'
            },
            {
              title: 'मूल आवश्यकता के आसपास की आवश्यकताओं को पहचानें।',
              body: 'संबंधित उत्पाद, परीक्षण, सुरक्षा और स्थापना मानकों को खोजें जिन्हें अक्सर अनदेखा कर दिया जाता है।'
            },
            {
              title: 'समुदायों के लिए चरणबद्ध निर्माण करें।',
              body: 'एक व्यापक इरादे को ऐसे तकनीकी विनिर्देश में बदलें जिसे समीक्षक और आपूर्तिकर्ता आसानी से समझ सकें।'
            }
          ],
          cta: 'आवास निविदा का अन्वेषण करें'
        },
        {
          id: 'bridge',
          number: '03',
          eyebrow: '03 / जोड़ने वाले सेतु',
          title: 'दो किनारों को जोड़ना',
          stages: [
            {
              title: 'एक संपर्क पहले स्पैन से पहले शुरू होता है।',
              body: 'बुनियादी ढांचे की निविदाओं के लिए स्पष्ट सामग्री, परीक्षण आवश्यकताएं और विशेषज्ञ समीक्षा की आवश्यकता होती है।'
            },
            {
              title: 'सहायक मानकों को सामने लाएं।',
              body: 'किसी सिफारिश के पीछे के संदर्भों को ट्रैक करें और जांचें कि क्या वर्तमान, सशर्त या अभी भी अनसुलझा है।'
            },
            {
              title: 'बेहतर निर्दिष्ट। बेहतर जुड़ा हुआ।',
              body: 'एक साधारण विवरण से शुरू करें। एक मजबूत तकनीकी संविदा तैयार करें।'
            }
          ],
          cta: 'निविदा स्टूडियो खोलें'
        }
      ],
      howItWorks: {
        eyebrow: 'भारत संविदा कैसे कार्य करता है',
        title: 'आपकी सामान्य भाषा से साक्ष्य-आधारित विनिर्देश तक।',
        step1Title: 'अपनी आवश्यकता बताएं',
        step1Body: 'अपनी आवश्यकता को सामान्य भाषा में लिखें या दस्तावेज़ संलग्न करें। किसी तकनीकी मानक ज्ञान की आवश्यकता नहीं।',
        step2Title: 'कमियों को सुलझाएं',
        step2Body: 'चार विकल्पों वाले स्पष्ट प्रश्नों के उत्तर देकर सामग्री, उपयोग और सुरक्षा मानकों को स्पष्ट करें।',
        step3Title: 'साक्ष्यों की समीक्षा करें',
        step3Body: 'प्राथमिक उत्पाद मानक, परीक्षण विधियां, प्रमाणन आवश्यकताएं और मसौदा विनिर्देश प्राप्त करें।'
      },
      finalCTA: {
        title: 'आप क्या बनाना चाहते हैं?',
        subtitle: 'सत्यापित भारतीय मानकों के साथ अपने तकनीकी विनिर्देश का मसौदा तैयार करना शुरू करें।',
        studioBtn: 'निविदा स्टूडियो शुरू करें',
        libraryBtn: 'कानूनी दस्तावेज़ देखें'
      }
    },
    studio: {
      breadcrumbNew: 'निविदा स्टूडियो / नया विवरण',
      heading: 'आप क्या खरीदना चाहते हैं?',
      subheading: 'इसे अपने शब्दों में लिखें। हम छूटे हुए विवरण और प्रासंगिक मानकों को खोजने में मदद करेंगे।',
      composerPlaceholder: 'अपनी आवश्यकता का वर्णन करें (उदा. स्कूल की कक्षाओं के लिए पेंट और फर्नीचर खरीदना है)...',
      charCount: 'वर्ण',
      addDocument: 'दस्तावेज़ जोड़ें',
      docHint: 'PDF, DOCX या TXT (अधिकतम 10MB प्रति फ़ाइल, कुल 20MB)',
      exampleChips: [
        'स्कूल की कक्षाओं के लिए पेंट और फर्नीचर खरीदना है।',
        'पानी के पाइप और आंतरिक वायरिंग के लिए आवास विवरण तैयार करें।',
        'पुल के लिए कंक्रीट और सुदृढीकरण से संबंधित मानक खोजें।'
      ],
      optionalDetailsTitle: 'वैकल्पिक परियोजना विवरण',
      procurementType: 'खरीद प्रकार',
      procuringEntity: 'खरीददार संस्था',
      stateUT: 'राज्य / केंद्र शासित प्रदेश',
      intendedDate: 'इच्छित निविदा प्रकाशन तिथि',
      privacyNote: 'हम AI के साथ साझा किए जाने वाले तकनीकी विवरण दिखाएंगे। अपने विवरण में गोपनीय या व्यक्तिगत जानकारी न डालें।',
      sessionNotice: 'किसी खाते की आवश्यकता नहीं है। आपका मसौदा अस्थायी है। यदि आप इसे रखना चाहते हैं तो इसे डाउनलोड करें।',
      reviewBriefBtn: 'मेरे विवरण की समीक्षा करें',
      privacyReviewTitle: 'गोपनीयता समीक्षा और न्यूनीकरण',
      privacyReviewDesc: 'विश्लेषण से पहले संवेदनशील जानकारियों की जांच करें। बाहरी मॉडल केवल अनुमोदित तकनीकी तथ्यों को प्राप्त करता है।',
      redactedBadge: 'संरक्षित भाग',
      detectedEntitiesLabel: 'पहचाने गए संवेदनशील पहचानकर्ता',
      proceedToAnalyzeBtn: 'साझा विवरण का विश्लेषण करें',
      backToEditBtn: 'संपादन पर वापस जाएं',
      loadingStages: [
        'आपके विवरण को पढ़ा जा रहा है',
        'उम्मीदवार मानकों को खोजा जा रहा है',
        'संबंधित संदर्भों की जांच की जा रही है',
        'आपकी समीक्षा तैयार की जा रही है'
      ],
      takingLonger: 'इसमें सामान्य से थोड़ा अधिक समय लग रहा है...',
      cancelBtn: 'विश्लेषण रद्द करें',
      clarification: {
        eyebrow: 'स्पष्टीकरण',
        reasonLabel: 'यह क्यों महत्वपूर्ण है:',
        customOption: 'कुछ और',
        customPlaceholder: 'किसी अन्य सतह, सामग्री या मिश्रित उपयोग का वर्णन करें...',
        notSureBtn: 'मुझे निश्चित नहीं है',
        skipBtn: 'अभी छोड़ें',
        useAnswerBtn: 'इस उत्तर का उपयोग करें',
        questionProgress: 'प्रश्न'
      },
      dossier: {
        title: 'साक्ष्यों के साथ आपका तकनीकी विवरण।',
        subtitle: 'निविदा में उपयोग करने से पहले सिफारिशों की समीक्षा करें और खुली आवश्यकताओं को हल करें।',
        tabs: {
          standards: 'मानक',
          related: 'संबंधित मानक',
          certification: 'कमियां और प्रमाणन',
          draft: 'मसौदा विनिर्देश',
          sources: 'स्रोत'
        },
        actions: {
          copy: 'मसौदा कॉपी करें',
          downloadPdf: 'PDF डाउनलोड करें',
          downloadDocx: 'Word डाउनलोड करें',
          downloadJson: 'JSON डाउनलोड करें',
          includeInDraft: 'मसौदे में शामिल करें',
          exclude: 'हटाएं',
          viewEvidence: 'साक्ष्य देखें'
        },
        reviewChecklistTitle: 'इस मसौदे का उपयोग करने से पहले',
        deleteSessionBtn: 'सत्र मिटाएँ',
        newBriefBtn: 'नया विवरण'
      }
    },
    library: {
      title: 'कानूनी दस्तावेज़ संग्रह',
      subtitle: 'सत्यापित भारतीय खरीद नियमावली, बीआईएस अधिनियम, विनियम और गुणवत्ता नियंत्रण आदेश।',
      searchPlaceholder: 'शीर्षक, मानक कोड (उदा. IS 15489), या जारीकर्ता द्वारा खोजें...',
      filterAll: 'सभी श्रेणियां',
      filterType: 'दस्तावेज़ प्रकार',
      filterAvailability: 'उपलब्धता',
      filterYear: 'वर्ष',
      readPdf: 'मूल PDF पढ़ें',
      viewSource: 'आधिकारिक स्रोत',
      downloadPdf: 'PDF डाउनलोड करें',
      page: 'पृष्ठ',
      zoomIn: 'ज़ूम इन',
      zoomOut: 'ज़ूम आउट',
      fitWidth: 'चौड़ाई में फ़िट करें',
      emptyCategory: 'इस श्रेणी में अभी तक कोई सत्यापित दस्तावेज़ नहीं है। आधिकारिक पोर्टल लिंक देखें।',
      currencyWarning: 'मुद्रा की पूरी समीक्षा नहीं की गई है। निविदा प्रकाशन से पहले जारीकर्ता प्राधिकारी से पुष्टि करें।'
    },
    demoNotice: 'प्रदर्शन मोड — उदाहरण के लिए सुझाव। वास्तविक AI विश्लेषण कॉन्फ़िगर नहीं है।'
  }
};
