











import type { SiteContent, Quote } from '../types';

const quotesData: Quote[] = [
    {
        quote: {
            ar: "المنزل هو نقطة الانطلاق التي يبدأ منها الإنسان.",
            en: "Home is the starting place of love, hope and dreams."
        },
        author: {
            ar: "تشارلز هنري باركهورست",
            en: "Charles Henry Parkhurst"
        }
    },
    {
        quote: {
            ar: "لا يوجد شيء أكثر أهمية من منزل جيد.",
            en: "There is nothing more important than a good, safe, secure home."
        },
        author: {
            ar: "روزالين كارتر",
            en: "Rosalynn Carter"
        }
    },
    {
        quote: {
            ar: "قوة الأمة مستمدة من نزاهة البيت.",
            en: "The strength of a nation derives from the integrity of the home."
        },
        author: {
            ar: "كونفوشيوس",
            en: "Confucius"
        }
    },
    {
        quote: {
            ar: "المنزل ليس مجرد مكان، إنه شعور.",
            en: "Home is not a place, it's a feeling."
        },
        author: {
            ar: "سيسيليا أهيرن",
            en: "Cecelia Ahern"
        }
    },
    {
        quote: {
            ar: "البيوت تصنع بالأيدي، أما المنازل فتبنى بالقلوب.",
            en: "A house is made of walls and beams; a home is built with love and dreams."
        },
        author: {
            ar: "مجهول",
            en: "Unknown"
        }
    },
    {
        quote: {
            ar: "السعادة هي رائحة منزل جديد.",
            en: "The smell of a new house is the smell of happiness."
        },
        author: {
            ar: "مجهول",
            en: "Unknown"
        }
    },
     {
        quote: {
            ar: "امتلاك منزل هو حجر الزاوية للثروة.",
            en: "Owning a home is a keystone of wealth."
        },
        author: {
            ar: "فرانكلين روزفلت",
            en: "Franklin D. Roosevelt"
        }
    },
    {
        quote: {
            ar: "أفضل وقت لزرع شجرة كان قبل 20 عامًا. ثاني أفضل وقت هو الآن.",
            en: "The best time to plant a tree was 20 years ago. The second best time is now."
        },
        author: {
            ar: "مثل صيني",
            en: "Chinese Proverb"
        }
    },
    {
        quote: {
            ar: "يجب أن تتحدث العمارة عن زمانها ومكانها، ولكنها تتوق إلى الخلود.",
            en: "Architecture should speak of its time and place, but yearn for timelessness."
        },
        author: {
            ar: "فرانك جيري",
            en: "Frank Gehry"
        }
    },
    {
        quote: {
            ar: "جوهر التصميم الداخلي سيكون دائمًا عن الناس وكيف يعيشون، وليس عن الموضة.",
            en: "The essence of interior design will always be about people and how they live, not about fashion."
        },
        author: {
            ar: "ألبرت هادلي",
            en: "Albert Hadley"
        }
    },
    {
        quote: {
            ar: "لا تضع في منزلك شيئًا لا تعرف أنه مفيد، أو لا تعتقد أنه جميل.",
            en: "Have nothing in your house that you do not know to be useful, or believe to be beautiful."
        },
        author: {
            ar: "ويليام موريس",
            en: "William Morris"
        }
    },
    {
        quote: {
            ar: "البساطة هي قمة التطور.",
            en: "Simplicity is the ultimate sophistication."
        },
        author: {
            ar: "ليوناردو دافنشي",
            en: "Leonardo da Vinci"
        }
    },
    {
        quote: {
            ar: "نحن نشكل مبانينا، وبعد ذلك هي التي تشكلنا.",
            en: "We shape our buildings; thereafter they shape us."
        },
        author: {
            ar: "ونستون تشرشل",
            en: "Winston Churchill"
        }
    },
    {
        quote: {
            ar: "البناء الجيد يأتي من أناس طيبين، وكل المشاكل تُحل بالتصميم الجيد.",
            en: "Good building comes from good people, and all problems are solved by good design."
        },
        author: {
            ar: "ستيفن غاردينر",
            en: "Stephen Gardiner"
        }
    },
    {
        quote: {
            ar: "المنزل يجب أن يكون هو صندوق كنز الحياة.",
            en: "The home should be the treasure chest of living."
        },
        author: {
            ar: "لو كوربوزييه",
            en: "Le Corbusier"
        }
    },
    {
        quote: {
            ar: "التصميم ليس فقط ما يبدو عليه وما تشعر به. التصميم هو كيف يعمل.",
            en: "Design is not just what it looks like and feels like. Design is how it works."
        },
        author: {
            ar: "ستيف جوبز",
            en: "Steve Jobs"
        }
    },
    {
        quote: {
            ar: "الشوق إلى الوطن يعيش فينا جميعًا.",
            en: "The ache for home lives in all of us."
        },
        author: {
            ar: "مايا أنجيلو",
            en: "Maya Angelou"
        }
    },
    {
        quote: {
            ar: "اشترِ أرضًا، فهم لم يعودوا يصنعون المزيد منها.",
            en: "Buy land, they’re not making it anymore."
        },
        author: {
            ar: "مارك توين",
            en: "Mark Twain"
        }
    },
    {
        quote: {
            ar: "العمارة هي في الحقيقة عن الرفاهية. أعتقد أن الناس يريدون أن يشعروا بالرضا في مكان ما.",
            en: "Architecture is really about well-being. I think that people want to feel good in a space."
        },
        author: {
            ar: "زها حديد",
            en: "Zaha Hadid"
        }
    },
    {
        quote: {
            ar: "يمكن للطبيب أن يدفن أخطاءه، لكن المهندس المعماري لا يمكنه إلا أن ينصح عملاءه بزرع الكروم.",
            en: "The physician can bury his mistakes, but the architect can only advise his clients to plant vines."
        },
        author: {
            ar: "فرانك لويد رايت",
            en: "Frank Lloyd Wright"
        }
    },
    {
        quote: {
            ar: "هناك ثلاث استجابات لقطعة من التصميم - نعم، لا، وواو! واو هي التي يجب أن تستهدفها.",
            en: "There are three responses to a piece of design – yes, no, and WOW! Wow is the one to aim for."
        },
        author: {
            ar: "ميلتون جلاسر",
            en: "Milton Glaser"
        }
    },
    {
        quote: {
            ar: "الإبداع هو أن تسمح لنفسك بارتكاب الأخطاء. أما التصميم فهو معرفة أي من هذه الأخطاء يجب الاحتفاظ بها.",
            en: "Creativity is allowing yourself to make mistakes. Design is knowing which ones to keep."
        },
        author: {
            ar: "سكوت آدامز",
            en: "Scott Adams"
        }
    },
    {
        quote: {
            ar: "الشيء السحري في المنزل هو أن مغادرته شعور جيد، والعودة إليه شعور أفضل.",
            en: "The magic thing about home is that it feels good to leave, and it feels even better to come back."
        },
        author: {
            ar: "ويندي وندر",
            en: "Wendy Wunder"
        }
    },
    {
        quote: {
            ar: "يسافر الإنسان حول العالم بحثًا عما يحتاجه، ويعود إلى منزله ليجده.",
            en: "A man travels the world over in search of what he needs and returns home to find it."
        },
        author: {
            ar: "جورج أ. مور",
            en: "George A. Moore"
        }
    },
    {
        quote: {
            ar: "العمارة هي فن إهدار المساحة.",
            en: "Architecture is the art of how to waste space."
        },
        author: {
            ar: "فيليب جونسون",
            en: "Philip Johnson"
        }
    },
    {
        quote: {
            ar: "المنزل هو حيث يسكن الحب، وتُصنع الذكريات، وينتمي الأصدقاء دائمًا، والضحك لا ينتهي أبدًا.",
            en: "Home is where love resides, memories are created, friends always belong, and laughter never ends."
        },
        author: {
            ar: "مجهول",
            en: "Unknown"
        }
    },
    {
        quote: {
            ar: "يعرف المصمم أنه بلغ الكمال ليس عندما لا يتبقى شيء ليضيفه، بل عندما لا يتبقى شيء ليزيله.",
            en: "A designer knows he has achieved perfection not when there is nothing left to add, but when there is nothing left to take away."
        },
        author: {
            ar: "أنطوان دو سانت إكزوبيري",
            en: "Antoine de Saint-Exupéry"
        }
    },
    {
        quote: {
            ar: "جوهر العمارة هو الشكل والمساحة، والضوء هو العنصر الأساسي.",
            en: "The essence of architecture is form and space, and light is the essential element."
        },
        author: {
            ar: "آي. إم. باي",
            en: "I. M. Pei"
        }
    },
    {
        quote: {
            ar: "للإبداع، يجب على المرء أولاً أن يتساءل عن كل شيء.",
            en: "To create, one must first question everything."
        },
        author: {
            ar: "إيلين جراي",
            en: "Eileen Gray"
        }
    },
    {
        quote: {
            ar: "لا يمكن فقدان العقارات أو سرقتها، ولا يمكن نقلها. عند شرائها بحس سليم، ودفع ثمنها بالكامل، وإدارتها بعناية معقولة، فهي أكثر الاستثمارات أمانًا في العالم.",
            en: "Real estate cannot be lost or stolen, nor can it be carried away. Purchased with common sense, paid for in full, and managed with reasonable care, it is about the safest investment in the world."
        },
        author: {
            ar: "فرانكلين روزفلت",
            en: "Franklin D. Roosevelt"
        }
    },
    {
        quote: {
            ar: "المنزل هو حيث تبدأ قصتنا.",
            en: "Home is where our story begins."
        },
        author: {
            ar: "مجهول",
            en: "Unknown"
        }
    },
    {
        quote: {
            ar: "الشكل يتبع الوظيفة.",
            en: "Form follows function."
        },
        author: {
            ar: "لويس سوليفان",
            en: "Louis Sullivan"
        }
    },
    {
        quote: {
            ar: "الأقل هو الأكثر.",
            en: "Less is more."
        },
        author: {
            ar: "لودفيج ميس فان دير روه",
            en: "Ludwig Mies van der Rohe"
        }
    },
    {
        quote: {
            ar: "لم تدرك الشمس مدى عظمتها حتى أصابت جانب مبنى.",
            en: "The sun never knew how great it was until it hit the side of a building."
        },
        author: {
            ar: "لويس كان",
            en: "Louis Kahn"
        }
    },
    {
        quote: {
            ar: "يجب ألا تسمح الغرفة للعين بالاستقرار في مكان واحد. يجب أن تبتسم لك وتخلق الخيال.",
            en: "A room should not allow the eye to settle in one place. It should smile at you and create fantasy."
        },
        author: {
            ar: "خوان مونتويا",
            en: "Juan Montoya"
        }
    },
    {
        quote: {
            ar: "كل مهندس معماري عظيم هو - بالضرورة - شاعر عظيم. يجب أن يكون مترجمًا أصيلًا عظيمًا لزمنه ويومه وعصره.",
            en: "Every great architect is — necessarily — a great poet. He must be a great original interpreter of his time, his day, his age."
        },
        author: {
            ar: "فرانك لويد رايت",
            en: "Frank Lloyd Wright"
        }
    }
];

export let siteContentData: SiteContent = {
  logoUrl: '',
  locationPickerMapUrl: 'https://i.imgur.com/y6z7x5y.jpeg',
  topBanner: {
    enabled: true,
    content: {
        ar: 'نسخة تجريبية (Beta) - نسعد باستقبال ملاحظاتكم لتحسين تجربة الاستخدام.',
        en: 'Beta Version - We welcome your feedback to improve the user experience.'
    }
  },
  contactConfiguration: {
    routing: 'internal',
    targetEmail: 'admin@onlyhelio.com',
  },
  paymentConfiguration: {
      instapay: {
          enabled: true,
          number: '01012345678',
          walletName: '', // Initialized empty
          paymentLink: '', // Initialized empty
          qrCodeUrl: '', // Initialized empty
          instructions: {
              ar: 'يرجى تحويل المبلغ على محفظة فودافون كاش الموضحة، ثم رفع صورة إيصال التحويل للتأكيد.',
              en: 'Please transfer the amount to the shown Vodafone Cash wallet, then upload the receipt screenshot for confirmation.'
          }
      },
      paymob: {
          enabled: false, // Disabled by default for now
          apiKey: '',
          secretKey: '',
          publicKey: ''
      }
  },
  hero: {
      // ... existing hero data ...
    ar: {
      title: 'بوابتك الحصرية لأرقى العقارات في هليوبوليس الجديدة',
      subtitle: 'في ONLY HELIO، نختص بتقديم روائع معمارية وخدمات متكاملة مصممة خصيصًا لتلبية طموحات سكان مدينة هليوبوليس الجديدة.',
    },
    en: {
      title: 'Your Exclusive Gateway to the Finest Properties in New Heliopolis',
      subtitle: 'At ONLY HELIO, we specialize in delivering architectural masterpieces and integrated services tailored to meet the ambitions of New Heliopolis residents.',
    },
    images: [
        {
            src: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=75&w=1600&auto=format&fit=crop",
            alt: { ar: "فيلا حديثة مع مسبح عند الغسق", en: "Modern villa with a pool at dusk" }
        },
        {
            src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=75&w=1600&auto=format&fit=crop",
            alt: { ar: "فيلا فاخرة بتصميم مستقبلي", en: "Luxury villa with a futuristic design" }
        },
        {
            src: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=75&w=1600&auto=format&fit=crop",
            alt: { ar: "منزل عائلي أنيق بواجهة بيضاء", en: "Elegant family house with a white facade" }
        },
        {
            src: "https://images.unsplash.com/photo-1593696140826-c58b02198d47?q=75&w=1600&auto=format&fit=crop",
            alt: { ar: "مبنى سكني حديث بواجهات زجاجية", en: "Modern apartment building with glass facades" }
        }
    ],
  },
  // ... keep existing homeCTA, homeListings, whyUs, services, partners, testimonials, socialProof, whyNewHeliopolis ...
  homeCTA: {
      enabled: true,
      ar: {
        title: "هل أنت مستعد للبدء؟",
        subtitle: "انضم إلى شبكة شركائنا الناجحين ومقدمي الخدمات المميزة في هليوبوليس الجديدة.",
        button: "تواصل الآن",
        link: "/contact"
      },
      en: {
        title: "Ready to Get Started?",
        subtitle: "Join our network of successful partners and distinguished service providers in New Heliopolis.",
        button: "Contact Us Now",
        link: "/contact"
      }
  },
  homeListings: {
      enabled: true,
      count: 4,
      ar: {
          title: "أحدث العقارات",
      },
      en: {
          title: "Latest Properties",
      }
  },
  whyUs: {
    enabled: true,
    ar: {
      title: 'لماذا تختار منصة ONLY HELIO؟',
      description: 'نحن لا نعرض العقارات فقط، بل نبني منظومة متكاملة مبنية على الثقة والخبرة لخدمة كل المهتمين بمدينة هليوبوليس الجديدة.',
      features: [
        { title: 'سوق شامل ومتخصص', description: 'أكبر تجمع للعقارات والخدمات مخصص حصريًا لمدينة هليوبوليس الجديدة في مكان واحد.' },
        { title: 'تواصل مباشر وموثوق', description: 'نوفر لك قناة اتصال مباشرة مع نخبة من المطورين وشركات التشطيب الموثوقة.' },
        { title: 'منظومة متكاملة', description: 'كل ما تحتاجه لمنزلك، من البحث عن العقار وحتى التشطيب والديكور، تحت سقف واحد.' },
        { title: 'شفافية وجودة', description: 'نلتزم بعرض شركاء موثوقين فقط، مما يضمن لك تجربة آمنة وموثوقة لاتخاذ قراراتك.' }
      ]
    },
    en: {
      title: 'Why Choose the ONLY HELIO Platform?',
      description: 'We don\'t just list properties; we build an integrated ecosystem based on trust and expertise to serve everyone interested in New Heliopolis.',
      features: [
        { title: 'Comprehensive & Specialized Market', description: 'The largest collection of properties and services dedicated exclusively to New Heliopolis, all in one place.' },
        { title: 'Direct & Trusted Connection', description: 'We provide a direct communication channel with a selection of trusted developers and finishing companies.' },
        { title: 'Integrated Ecosystem', description: 'Everything you need for your new home, from property search to finishing and decoration, under one roof.' },
        { title: 'Transparency & Quality', description: 'We are committed to featuring only trusted partners, ensuring a safe and reliable experience for your decisions.' }
      ]
    }
  },
  services: {
    enabled: true,
    ar: {
      title: 'خدماتنا المتكاملة',
      description: 'نقدم حلولاً شاملة ومخصصة لمدينة هليوبوليس الجديدة، تلبي كافة احتياجاتكم العقارية من التصميم والديكور إلى التشطيبات والتسويق.',
      features: [
        { title: 'الخدمات العقارية', description: 'نوفر خدمات بيع وشراء وتأجير العقارات، مع إمكانية عرض عقارك مباشرة على منصتنا.', link: "/properties", icon: 'BuildingIcon' },
        { title: 'التشطيب والتصميم الداخلي', description: 'نقدم حلولاً متكاملة بدءًا من التصاميم والمقايسات الدقيقة، وصولاً للتنفيذ بأعلى جودة.', link: "/finishing", icon: 'FinishingIcon' },
        { title: 'الديكورات والتحف الفنية', description: 'نصمم وننفذ ديكورات جدارية ومنحوتات فنية، ونوفر لوحات وتحف فريدة لإضفاء لمسة جمالية.', link: "/decorations", icon: 'DecorationIcon' }
      ]
    },
    en: {
      title: 'Our Integrated Services',
      description: 'We provide comprehensive and customized solutions for New Heliopolis city, meeting all your real estate needs from design and decor to finishing and marketing.',
      features: [
        { title: 'Real Estate Services', description: 'We offer services for buying, selling, and renting properties, with the ability to list your property directly on our platform.', link: "/properties", icon: 'BuildingIcon' },
        { title: 'Finishing & Interior Design', description: 'We provide integrated solutions, from detailed designs and estimates to high-quality execution.', link: "/finishing", icon: 'FinishingIcon' },
        { title: 'Decorations & Antiques', description: 'We design and create wall decorations and sculptures, and provide unique paintings and antiques to add a touch of beauty.', link: "/decorations", icon: 'DecorationIcon' }
      ]
    }
  },
  partners: {
    enabled: true,
    ar: {
        title: 'شركاء العمل',
        description: 'نتعاون مع نخبة من المطورين والشركات لتقديم أفضل الخدمات في هليوبوليس الجديدة.',
        mega_projects_title: 'كبار المطورين',
        developers_title: 'مطورو المدينة',
        finishing_companies_title: 'شركات التشطيب والتصميم',
        agencies_title: 'المكاتب العقارية',
        investor_partners_title: 'شركاؤنا المستثمرون'
    },
    en: {
        title: 'Our Business Partners',
        description: 'We collaborate with a selection of top developers and companies to offer the best services in New Heliopolis.',
        mega_projects_title: 'Major Developers',
        developers_title: 'City Developers',
        finishing_companies_title: 'Finishing & Design Companies',
        agencies_title: 'Real Estate Agencies',
        investor_partners_title: 'Our Investor Partners'
    }
  },
  testimonials: {
    enabled: true,
    ar: {
        title: 'ماذا يقول عملاؤنا',
        subtitle: 'قصص حقيقية من أصحاب المنازل والشركاء الراضين.'
    },
    en: {
        title: 'What Our Clients Say',
        subtitle: 'Real stories from satisfied homeowners and partners.'
    },
    items: [
        {
            quote: {
                en: 'Only Helio helped me find the perfect villa for my family. The process was smooth and professional from start to finish!',
                ar: 'ساعدني أونلي هيليو في العثور على الفيلا المثالية لعائلتي. كانت العملية سلسة واحترافية من البداية إلى النهاية!',
            },
            author: {
                en: 'Ahmed Hassan',
                ar: 'أحمد حسن',
            },
            location: {
                en: 'New Heliopolis Resident',
                ar: 'من سكان هليوبوليس الجديدة',
            },
        },
        {
            quote: {
                en: 'The finishing services are top-notch. They transformed my apartment into a dream home. Highly recommended.',
                ar: 'خدمات التشطيب على أعلى مستوى. لقد حولوا شقتي إلى منزل الأحلام. أوصي بهم بشدة.',
            },
            author: {
                en: 'Fatima Ali',
                ar: 'فاطمة علي',
            },
            location: {
                en: 'New Cairo',
                ar: 'القاهرة الجديدة',
            },
        },
    ]
  },
  socialProof: {
    enabled: true,
    stats: [
        { value: '150+', name: { en: 'Properties Listed', ar: 'عقار معروض' } },
        { value: '50+', name: { en: 'Happy Clients', ar: 'عميل سعيد' } },
        { value: '10+', name: { en: 'Years of Experience', ar: 'سنوات من الخبرة' } },
        { value: '20+', name: { en: 'Partner Companies', ar: 'شركة شريكة' } },
    ],
  },
  whyNewHeliopolis: {
    enabled: true,
    ar: {
      title: 'لماذا هليوبوليس الجديدة؟',
      location: {
        title: 'مستقبل واعد وموقع استراتيجي فريد',
        description: 'هليوبوليس الجديدة ليست مجرد امتداد عمراني، بل هي رؤية لمستقبل الحياة العصرية في شرق القاهرة. بفضل موقعها الاستراتيجي على مقربة من المحاور الرئيسية، أصبحت المدينة نقطة انطلاق مثالية نحو العاصمة الإدارية، القاهرة الجديدة، ومدينة بدر، مع الحفاظ على هدوء وخصوصية مجتمعاتها السكنية.',
        stats: [
          { value: '15 دقيقة', desc: 'للعاصمة الإدارية' },
          { value: '20 دقيقة', desc: 'للقاهرة الجديدة' },
          { value: '10 دقائق', desc: 'لمدينتي والشروق' },
          { value: '30 دقيقة', desc: 'لمطار القاهرة الدولي' },
        ]
      }
    },
    en: {
      title: 'Why New Heliopolis?',
      location: {
        title: 'A Promising Future and a Unique Strategic Location',
        description: 'New Heliopolis is not just an urban extension; it is a vision for the future of modern living in East Cairo. Thanks to its strategic location near major axes, the city has become an ideal launchpad to the New Administrative Capital, New Cairo, and Badr City, while maintaining the tranquility and privacy of its residential communities.',
        stats: [
          { value: '15 mins', desc: 'to the New Capital' },
          { value: '20 mins', desc: 'to New Cairo' },
          { value: '10 mins', desc: 'to Madinaty & El Shorouk' },
          { value: '30 mins', desc: 'to Cairo International Airport' },
        ]
      }
    },
    images: [
        { src: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=75&w=1200&auto=format&fit=crop", alt: { ar: "خريطة توضح موقع هليوبوليس الجديدة", en: "Map showing location of New Heliopolis" } },
        { src: "https://images.unsplash.com/photo-1595995449553-15104a3b3f9?q=75&w=1200&auto=format&fit=crop", alt: { ar: "بوابة هليوبوليس الجديدة", en: "Gate of New Heliopolis" } }
    ]
  },
  finishingServices: [
    {
      title: { ar: 'الاستشارة ووضع التصور', en: 'Consultation & Concept Design' },
      description: {
        ar: 'جلسات استشارية معمقة مع مهندسينا لفهم رؤيتك ومتطلباتك، نترجمها إلى تصورات مبدئية مبتكرة للتصميم الداخلي مع تقديم مقايسات تقديرية دقيقة للتكاليف وخيارات المواد.',
        en: 'In-depth consultation sessions with our engineers to understand your vision and requirements, translating them into innovative initial interior design concepts with accurate cost estimates and material options.'
      },
      pricingTiers: [
        { unitType: { ar: 'مكالمة استشارية أولية', en: 'Initial Consultation Call' }, areaRange: { ar: 'جلسة أونلاين (60 دقيقة)', en: 'Online Session (60 min)' }, price: 1500 },
        { unitType: { ar: 'زيارة موقع واستشارة', en: 'On-site Visit & Consultation' }, areaRange: { ar: 'جلسة في الموقع (3 ساعات)', en: 'On-site Session (3 hours)' }, price: 4000 },
        { unitType: { ar: 'ورشة عمل وتخطيط', en: 'Full Planning Workshop' }, areaRange: { ar: 'يوم كامل (موقع/مكتب)', en: 'Full Day (Site/Office)' }, price: 10000 }
      ]
    },
    {
      title: { ar: 'التصميم ثلاثي الأبعاد', en: '3D Design & Visualization' },
      description: {
        ar: 'نحول التصور المبدئي إلى تصميم ثلاثي الأبعاد واقعي وتفاعلي، مما يسمح لك بالتجول افتراضيًا في منزلك المستقبلي وتعديل التفاصيل قبل البدء في أي أعمال تنفيذ.',
        en: 'We transform the initial concept into a realistic and interactive 3D design, allowing you to virtually walk through your future home and adjust details before any implementation work begins.'
      },
      pricingTiers: [
        { unitType: { ar: 'شقة', en: 'Apartment' }, areaRange: { ar: 'حتى 150 م²', en: 'Up to 150m²' }, price: 15000 },
        { unitType: { ar: 'شقة', en: 'Apartment' }, areaRange: { ar: '151 - 250 م²', en: '151m² - 250m²' }, price: 20000 },
        { unitType: { ar: 'فيلا', en: 'Villa' }, areaRange: { ar: 'حتى 300 م²', en: 'Up to 300m²' }, price: 30000 },
        { unitType: { ar: 'فيلا', en: 'Villa' }, areaRange: { ar: 'أكثر من 300 م²', en: 'Above 300m²' }, price: 45000 }
      ]
    }
  ],
  projectsPage: {
    ar: { title: 'اكتشف مشاريعنا الرائدة', subtitle: 'مجموعة من أرقى المشاريع السكنية والتجارية في هليوبوليس الجديدة، مقدمة من نخبة المطورين العقاريين.' },
    en: { title: 'Discover Our Flagship Projects', subtitle: 'A collection of the finest residential and commercial projects in New Heliopolis, presented by elite real estate developers.' }
  },
  finishingPage: {
    ar: {
      heroTitle: 'تشطيب وتصميم داخلي في هليوبوليس الجديدة',
      heroSubtitle: 'نقدم خدمات تشطيب وتصميم داخلي مخصصة لمشاريعكم في مدينة هليوبوليس الجديدة، ونحول رؤيتكم إلى واقع ملموس.',
      servicesTitle: 'ابدأ التخطيط لمشروعك معنا',
      servicesSubtitle: 'اختر الباقة التي تناسب احتياجاتك الحالية، سواء كنت في مرحلة التخطيط أو جاهزًا للتنفيذ.',
      servicesIntro: 'نقدم من خلال فريقنا المختص خدمات الاستشارة والتصميم لمساعدتك في التخطيط لمشروعك. أما إذا كنت تبحث عن التنفيذ، فيمكنك استعراض شركائنا الموثوقين أدناه.',
      partnerCompaniesTitle: 'اختر إحدى شركات التنفيذ',
      partnerCompaniesSubtitle: 'تصفح شبكتنا من شركات التشطيب والتصميم الموثوقة التي لها ملفات تعريفية وأعمال سابقة.',
      serviceProvidersTitle: 'أو تواصل مع مقدمي الخدمة مباشرة',
      serviceProvidersSubtitle: 'قائمة بمقدمي خدمات التشطيب المسجلين في الباقة المجانية. يمكنك طلب خدمتهم مباشرة.',
      ctaTitle: 'هل لديك مشروع في هليوبوليس الجديدة؟',
      ctaSubtitle: 'إذا كنت تملك وحدة في هليوبوليس الجديدة وترغب في تشطيبها بأعلى جودة، تواصل معنا اليوم للحصول على استشارة مجانية.',
      ctaButton: 'ابدأ مشروعك الآن'
    },
    en: {
      heroTitle: 'Finishing & Interior Design in New Heliopolis',
      heroSubtitle: 'We offer custom finishing and interior design services for your projects in New Heliopolis, turning your vision into a tangible reality.',
      servicesTitle: 'Start Planning Your Project with Us',
      servicesSubtitle: 'Choose the package that fits your current needs, whether you\'re in the planning phase or ready for execution.',
      servicesIntro: 'Through our specialized team, we offer consultation and design services to help you plan your project. If you\'re looking for execution, you can browse our trusted partners below.',
      partnerCompaniesTitle: 'Choose an Execution Partner Company',
      partnerCompaniesSubtitle: 'Browse our network of trusted finishing and design companies with profiles and portfolios.',
      serviceProvidersTitle: 'Or Contact a Service Provider Directly',
      serviceProvidersSubtitle: 'A list of finishing service providers on our free plan. You can request their service directly.',
      ctaTitle: 'Do you have a project in New Heliopolis?',
      ctaSubtitle: 'If you own a unit in New Heliopolis and want to finish it to the highest quality, contact us today for a free consultation.',
      ctaButton: 'Start Your Project Now'
    }
  },
  decorationsPage: {
    ar: {
      heroTitle: 'إبداعات فنية تزين جدرانك',
      heroSubtitle: 'نصمم وننفذ منحوتات فنية مباشرة على الجدران لتحويلها إلى قطعة فنية فريدة. استلهم من أعمالنا أو زودنا بفكرتك الخاصة لنحولها إلى واقع.',
      sculptures_desc: 'نصمم وننفذ منحوتات فنية مباشرة على الجدران لتحويلها إلى قطعة فنية فريدة. استلهم من أعمالنا أو زودنا بفكرتك الخاصة لنحولها إلى واقع.',
      paintings_desc: 'مجموعة فريدة من اللوحات الفنية التي تناسب جميع الأذواق والمساحات، منفذة بأيدي فنانين محترفين.',
      antiques_desc: 'تشكيلة مختارة من التحف وقطع الديكور التي تضيف لمسة من الأناقة والفخامة لمساحتك.'
    },
    en: {
      heroTitle: 'Artistic Creations to Adorn Your Walls',
      heroSubtitle: 'We design and create art sculptures directly on walls to turn them into unique masterpieces. Get inspired by our work or provide your own idea to bring it to life.',
      sculptures_desc: 'We design and execute art sculptures directly on walls to transform them into unique masterpieces. Get inspired by our work or provide your own idea to bring it to life.',
      paintings_desc: 'A unique collection of art paintings to suit all tastes and spaces, created by professional artists.',
      antiques_desc: 'A curated selection of antiques and decor pieces that add a touch of elegance and luxury to your space.'
    }
  },
  quotes: quotesData,
  // Legal Pages Initialization
  privacyPolicy: {
      ar: {
          title: "سياسة الخصوصية",
          lastUpdated: "آخر تحديث: نوفمبر 2025",
          sections: [
              { title: "1. مقدمة", content: "نحن في منصة ONLY HELIO (المشار إليها بـ \"نحن\"، \"المنصة\"، أو \"الموقع\")، نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا ومشاركتنا لمعلوماتك عند استخدامك لمنصتنا المتخصصة في عقارات وخدمات مدينة هليوبوليس الجديدة. باستخدامك للموقع، فإنك توافق على الممارسات الموضحة في هذه السياسة." },
              { title: "2. البيانات التي نجمعها", content: "قد نقوم بجمع الأنواع التالية من البيانات:\n• **معلومات الهوية:** الاسم الكامل، رقم الهاتف، عنوان البريد الإلكتروني.\n• **تفاصيل الطلبات:** تفاصيل العقار الذي ترغب في شرائه أو بيعه، تفضيلات التشطيب، ونوع الخدمة المطلوبة.\n• **المحتوى الذي تنشئه:** صور العقارات، وصف العقارات، والاستفسارات المرسلة عبر النماذج.\n• **البيانات التقنية:** عنوان IP، نوع المتصفح، وتفضيلات اللغة.\n• **بيانات الموقع الجغرافي:** قد نطلب الوصول إلى موقعك لتسهيل عرض العقارات القريبة، وذلك بموافقتك الصريحة." },
              { title: "3. كيف نستخدم بياناتك", content: "نستخدم بياناتك للأغراض التالية:\n• ربطك بمقدمي الخدمات المناسبين (مطورين، سماسرة، شركات تشطيب).\n• تحسين تجربة البحث عن العقارات باستخدام خوارزميات التوصية.\n• **استخدام الذكاء الاصطناعي (AI):** نستخدم نماذج الذكاء الاصطناعي (مثل Google Gemini) لتحليل استعلامات البحث الخاصة بك وتقديم نتائج أكثر دقة، بالإضافة إلى إنشاء تقديرات أولية لتكاليف التشطيب. يتم معالجة هذه البيانات بطريقة آمنة ولا يتم استخدامها لتدريب نماذج عامة بطريقة تكشف هويتك.\n• التواصل معك بخصوص تحديثات الطلبات أو العروض الجديدة." },
              { title: "4. مشاركة البيانات", content: "بصفتنا منصة وسيطة، فإننا نشارك بيانات الاتصال الخاصة بك وتفاصيل طلبك مع:\n• **الشركاء المسجلين:** (المطورون العقاريون، شركات التشطيب، المكاتب العقارية) فقط عندما تقوم بإرسال طلب استفسار أو خدمة محددة لجهة معينة أو تطلب خدمة عامة تتطلب توجيهها لأفضل مزود خدمة.\n• **مقدمي الخدمات التقنية:** الذين يساعدوننا في تشغيل الموقع (مثل استضافة البيانات وخدمات التحليل).\n• **الجهات القانونية:** عند الضرورة للامتثال للقوانين المحلية." },
              { title: "5. أمن البيانات", content: "نطبق تدابير أمنية تقنية وتنظيمية مناسبة لحماية بياناتك من الوصول غير المصرح به أو الفقدان. ومع ذلك، لا يمكن ضمان أمن البيانات المنقولة عبر الإنترنت بنسبة 100%." },
              { title: "6. التغييرات على السياسة", content: "قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر لتعكس التغييرات في ممارساتنا أو القوانين المعمول بها. سيتم نشر أي تغييرات في هذه الصفحة مع تحديث تاريخ \"آخر تحديث\"." },
              { title: "7. تواصل معنا", content: "إذا كان لديك أي أسئلة أو مخاوف بخصوص خصوصيتك، يرجى التواصل معنا عبر صفحة \"تواصل معنا\" أو عبر البريد الإلكتروني: info@onlyhelio.com." }
          ]
      },
      en: {
          title: "Privacy Policy",
          lastUpdated: "Last Updated: November 2025",
          sections: [
              { title: "1. Introduction", content: "At ONLY HELIO (\"we\", \"our\", or \"the Platform\"), we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, and share your information when you use our platform specialized in New Heliopolis real estate and services. By using the site, you agree to the practices described in this policy." },
              { title: "2. Data We Collect", content: "We may collect the following types of data:\n• **Identity Information:** Full name, phone number, email address.\n• **Request Details:** Details of the property you wish to buy or sell, finishing preferences, and type of service requested.\n• **User-Generated Content:** Property photos, descriptions, and inquiries sent via forms.\n• **Technical Data:** IP address, browser type, and language preferences.\n• **Geolocation Data:** We may request access to your location to facilitate showing nearby properties, with your explicit consent." },
              { title: "3. How We Use Your Data", content: "We use your data for the following purposes:\n• Connecting you with appropriate service providers (developers, brokers, finishing companies).\n• Improving the property search experience using recommendation algorithms.\n• **AI Usage:** We utilize Artificial Intelligence models (such as Google Gemini) to analyze your search queries to provide more accurate results and to generate initial finishing cost estimates. This data is processed securely and is not used to train public models in a way that reveals your identity.\n• Contacting you regarding request updates or new offers." },
              { title: "4. Data Sharing with Third Parties", content: "As an intermediary platform, we share your contact data and request details with:\n• **Registered Partners:** (Real Estate Developers, Finishing Companies, Agencies) only when you submit an inquiry or specific service request to a particular entity or request a general service that requires routing to the best provider.\n• **Technical Service Providers:** Who assist us in operating the site (such as data hosting and analytics services).\n• **Legal Authorities:** When necessary to comply with local laws." },
              { title: "5. Data Security", content: "We implement appropriate technical and organizational security measures to protect your data from unauthorized access or loss. However, data transmission over the internet cannot be guaranteed to be 100% secure." },
              { title: "6. Changes to Policy", content: "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. Any changes will be posted on this page with an updated \"Last Updated\" date." },
              { title: "7. Contact Us", content: "If you have any questions or concerns regarding your privacy, please contact us via the \"Contact Us\" page or email: info@onlyhelio.com." }
          ]
      }
  },
  termsOfUse: {
      ar: {
          title: "شروط الاستخدام",
          lastUpdated: "آخر تحديث: نوفمبر 2025",
          sections: [
              { title: "1. الموافقة على الشروط", content: "مرحبًا بك في ONLY HELIO. بوصولك إلى هذا الموقع واستخدامه، فإنك توافق على الالتزام بشروط الاستخدام هذه وجميع القوانين واللوائح المعمول بها. إذا كنت لا توافق على أي من هذه الشروط، فيُحظر عليك استخدام هذا الموقع." },
              { title: "2. وصف الخدمة ودور المنصة", content: "ONLY HELIO هي منصة رقمية تعمل كدليل وسوق للعقارات وخدمات التشطيب في مدينة هليوبوليس الجديدة.\n• **نحن لسنا طرفاً في المعاملات العقارية:** نحن نعمل كمنصة للإدراج والربط بين المستخدمين ومقدمي الخدمات. نحن لا نملك العقارات المعروضة (إلا ما تم ذكره صراحة) ولا نضمن جودة أعمال التشطيب.\n• **دقة المعلومات:** بينما نسعى جاهدين لضمان دقة المعلومات، فإننا لا نضمن خلو الموقع من الأخطاء." },
              { title: "3. حسابات المستخدمين", content: "• أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور.\n• يجب أن تكون المعلومات التي تقدمها دقيقة وحديثة.\n• نحتفظ بالحق في إنهاء الحسابات أو إزالة المحتوى الذي ينتهك شروطنا." },
              { title: "4. الاستخدام المحظور", content: "يُمنع منعًا باتًا:\n• استخدام الموقع لأي غرض غير قانوني.\n• محاولة اختراق الموقع أو جمع البيانات بشكل آلي (Scraping).\n• نشر معلومات عقارية كاذبة أو مضللة.\n• الإساءة أو المضايقة لأي مستخدم آخر أو شريك." },
              { title: "5. الملكية الفكرية", content: "جميع المحتويات الموجودة على الموقع، بما في ذلك النصوص، التصاميم، الشعارات، والأكواد، هي ملك لـ ONLY HELIO أو مرخصة لها، ومحمية بموجب قوانين حقوق النشر." },
              { title: "6. إخلاء المسؤولية", content: "يتم تقديم المواد على موقع ONLY HELIO \"كما هي\". لا تقدم المنصة أي ضمانات، صريحة أو ضمنية، وتخلي مسؤوليتها عن أي أضرار قد تنشأ عن استخدام الموقع أو الاعتماد على أي معلومات مدرجة فيه. أي تعامل بينك وبين أي شريك (مطور أو شركة تشطيب) هو تعامل مباشر وعلى مسؤوليتك الخاصة." },
              { title: "7. حدود المسؤولية", content: "لن تكون ONLY HELIO أو موردوها مسؤولين بأي حال من الأحوال عن أي أضرار (بما في ذلك، دون حصر، الأضرار الناجمة عن فقدان البيانات أو الأرباح) تنشأ عن استخدام أو عدم القدرة على استخدام المواد على الموقع." },
              { title: "8. القانون الواجب التطبيق", content: "تخضع هذه الشروط والأحكام وتفسر وفقًا لقوانين جمهورية مصر العربية، وتخضع أي نزاعات للاختصاص القضائي الحصري للمحاكم المصرية." },
              { title: "9. الاستفسارات", content: "لأي استفسارات بخصوص شروط الاستخدام، يرجى التواصل معنا عبر: info@onlyhelio.com." }
          ]
      },
      en: {
          title: "Terms of Use",
          lastUpdated: "Last Updated: November 2025",
          sections: [
              { title: "1. Agreement to Terms", content: "Welcome to ONLY HELIO. By accessing and using this website, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site." },
              { title: "2. Service Description & Platform Role", content: "ONLY HELIO is a digital platform acting as a directory and marketplace for real estate and finishing services in New Heliopolis.\n• **We are not a party to real estate transactions:** We act as a listing and connecting platform between users and service providers. We do not own the listed properties (unless explicitly stated) and do not guarantee the quality of finishing works.\n• **Information Accuracy:** While we strive to ensure information accuracy, we do not warrant that the site is free of errors." },
              { title: "3. User Accounts", content: "• You are responsible for maintaining the confidentiality of your account information and password.\n• The information you provide must be accurate and up-to-date.\n• We reserve the right to terminate accounts or remove content that violates our terms." },
              { title: "4. Prohibited Use", content: "It is strictly prohibited to:\n• Use the site for any illegal purpose.\n• Attempt to hack the site or collect data automatically (Scraping).\n• Post false or misleading real estate information.\n• Abuse or harass any other user or partner." },
              { title: "5. Intellectual Property", content: "All content on the site, including text, designs, logos, and code, is the property of ONLY HELIO or its licensors and is protected by copyright laws." },
              { title: "6. Disclaimer", content: "The materials on ONLY HELIO website are provided \"as is\". The platform makes no warranties, expressed or implied, and disclaims liability for any damages arising from the use of the site or reliance on any listed information. Any dealing between you and any partner (developer or finishing company) is a direct dealing at your own risk." },
              { title: "7. Limitation of Liability", content: "In no event shall ONLY HELIO or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials on the site." },
              { title: "8. Governing Law", content: "These terms and conditions are governed by and construed in accordance with the laws of the Arab Republic of Egypt, and any disputes shall be subject to the exclusive jurisdiction of the Egyptian courts." },
              { title: "9. Inquiries", content: "For any inquiries regarding the Terms of Use, please contact us at: info@onlyhelio.com." }
          ]
      }
  },
  footer: {
    ar: {
      description: 'وجهتكم الأولى لاستكشاف أرقى العقارات والخدمات المتكاملة في قلب هليوبوليس الجديدة. نحن نصنع روائع معمارية تلبي طموحاتكم.',
      address: 'هليوبوليس الجديدة, القاهرة, مصر',
      hours: 'الأحد - الخميس: 9 صباحًا - 6 مساءً',
    },
    en: {
      description: 'Your premier destination for exploring the finest properties and integrated services in the heart of New Heliopolis. We create architectural masterpieces that meet your ambitions.',
      address: 'New Heliopolis, Cairo, Egypt',
      hours: 'Sunday - Thursday: 9 AM - 6 PM',
    },
    phone: '+20 123 456 7890',
    isWhatsAppOnly: true,
    email: 'info@onlyhelio.com',
    social: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
      linkedin: '#'
    },
    copyright: {
        en: '© 2025 ONLY HELIO. All rights reserved.',
        ar: '© 2025 ONLY HELIO. جميع الحقوق محفوظة.'
    },
    feedbackText: {
        en: 'Send Feedback',
        ar: 'إرسال ملاحظات'
    }
  }
};