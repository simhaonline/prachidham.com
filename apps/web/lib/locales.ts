export const supportedLocales = ['gu', 'hi', 'en'] as const;
export type Locale = (typeof supportedLocales)[number];

export function isLocale(value: string): value is Locale {
  return supportedLocales.some((locale) => locale === value);
}

export function localeHref(locale: Locale, path = ''): string {
  if (path && !/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(path)) throw new Error('Unsafe locale path');
  return `/${locale}${path ? `/${path}` : ''}`;
}

export function localeFromPath(pathname: string): Locale | null {
  const first = pathname.split('/')[1];
  return isLocale(first) ? first : null;
}

const en = {
  brandSubheading: 'Foundation · Gir Somnath',
  skip: 'Skip to content', navLabel: 'Main navigation', home: 'Home', shop: 'Shop', services: 'Services', contact: 'Contact', staff: 'Staff sign in', language: 'Language',
  kicker: 'Prachi Tirth · Gujarat', heroTitle: 'Rooted in heritage.', heroAccent: 'Open to service.',
  heroLead: 'Prachi Dham Foundation is preparing a place to share its work, services and community offerings in Gir Somnath.',
  heroAction: 'Explore our purpose', reviewNote: 'Service availability and public catalog entries appear only after foundation review.',
  aboutIndex: '01 / THE FOUNDATION', aboutLabel: 'Our purpose', aboutTitle: 'A foundation with many paths to serve.',
  aboutBody: 'The Foundation’s stated objectives include cultural preservation, education, social welfare, animal care and environmental protection. Details of active programs will be published after verification.',
  offeringsIndex: '02 / DISCOVER', offeringsLabel: 'Discover', offeringsTitle: 'Services and offerings, with clarity.',
  offeringsBody: 'Browse only reviewed public listings. Product prices and service availability are managed separately; an inquiry is never a payment or booking.',
  shopAction: 'View products', servicesAction: 'View services', updatesLabel: 'Connect', updatesTitle: 'Begin a conversation.',
  updatesBody: 'Ask the Foundation about current programs or a specific service. Please do not send sensitive family or payment details by email.',
  contactAction: 'Contact the foundation', footerLocation: 'Prachi Tirth · Gir Somnath, Gujarat',
  shopTitle: 'Shop & offerings', shopLead: 'Published products, with reviewed descriptions and current listed amounts. Ordering and payment are not active yet.',
  servicesTitle: 'Services', servicesLead: 'Reviewed services for public discovery. Scheduling and payments are not active yet.',
  loading: 'Loading available listings…', retry: 'Try again', privacyPolicy: 'Privacy policy', empty: 'No approved listings are available in this language yet.',
  catalogError: 'The catalog is unavailable at the moment. Please try again later.', details: 'View details',
  listingTypeProduct: 'Product', listingTypeService: 'Service', priceOnRequest: 'Contact for details', listedAmount: 'Listed amount',
  backToShop: 'Back to offerings', inquiryNotice: 'This is an inquiry, not a booking or payment. Availability and final details require staff confirmation.',
  contactTitle: 'Contact Prachi Dham Foundation', contactLead: 'For current programs, services and product availability, get in touch through the contact information supplied by the Foundation.',
  emailLabel: 'Email', phoneLabel: 'Phone', locationLabel: 'Location', contactNote: 'Please do not email payment card details or sensitive family information.',
  staffCatalog: 'Catalog management',
  inquiryName: 'Your name', inquiryEmail: 'Email address', inquiryConsent: 'I have read the privacy policy and agree to be contacted about this inquiry.',
  inquirySend: 'Request availability', inquirySuccess: 'Your inquiry has been received. No payment was taken.', inquiryError: 'The request could not be submitted. Please try again later.',
  inquiryQuantity: 'Quantity', inquiryContact: 'Ask about this listing',
};
export type Messages = typeof en;

const hi: Messages = {
  brandSubheading: 'फाउंडेशन · गिर सोमनाथ',
  skip: 'मुख्य सामग्री पर जाएँ', navLabel: 'मुख्य नेविगेशन', home: 'मुखपृष्ठ', shop: 'उत्पाद', services: 'सेवाएँ', contact: 'संपर्क', staff: 'कर्मचारी लॉगिन', language: 'भाषा',
  kicker: 'प्राची तीर्थ · गुजरात', heroTitle: 'परंपरा में जड़ें।', heroAccent: 'सेवा की ओर कदम।',
  heroLead: 'प्राची धाम फाउंडेशन गिर सोमनाथ में अपने कार्य, सेवाओं और सामुदायिक प्रस्तावों की जानकारी साझा करने के लिए यह स्थान तैयार कर रहा है।',
  heroAction: 'हमारा उद्देश्य जानें', reviewNote: 'फाउंडेशन की समीक्षा के बाद ही सेवा उपलब्धता और सार्वजनिक सूची दिखाई जाएगी।',
  aboutIndex: '01 / फाउंडेशन', aboutLabel: 'हमारा उद्देश्य', aboutTitle: 'सेवा के कई मार्ग, एक साझा उद्देश्य।',
  aboutBody: 'फाउंडेशन के घोषित उद्देश्यों में संस्कृति का संरक्षण, शिक्षा, सामाजिक कल्याण, पशु देखभाल और पर्यावरण संरक्षण शामिल हैं। सक्रिय कार्यक्रमों का विवरण पुष्टि के बाद प्रकाशित होगा।',
  offeringsIndex: '02 / खोजें', offeringsLabel: 'जानें', offeringsTitle: 'सेवाओं और उत्पादों की स्पष्ट जानकारी।',
  offeringsBody: 'केवल समीक्षा के बाद प्रकाशित सूचियाँ देखें। उत्पाद मूल्य और सेवा उपलब्धता अलग से प्रबंधित हैं; पूछताछ भुगतान या बुकिंग नहीं है।',
  shopAction: 'उत्पाद देखें', servicesAction: 'सेवाएँ देखें', updatesLabel: 'जुड़ें', updatesTitle: 'बातचीत की शुरुआत करें।',
  updatesBody: 'वर्तमान कार्यक्रम या किसी सेवा के बारे में फाउंडेशन से पूछें। ईमेल से संवेदनशील पारिवारिक या भुगतान जानकारी न भेजें।',
  contactAction: 'फाउंडेशन से संपर्क करें', footerLocation: 'प्राची तीर्थ · गिर सोमनाथ, गुजरात',
  shopTitle: 'उत्पाद और प्रस्ताव', shopLead: 'समीक्षा के बाद प्रकाशित उत्पाद और सूचीबद्ध राशि। ऑर्डर और भुगतान अभी सक्रिय नहीं हैं।',
  servicesTitle: 'सेवाएँ', servicesLead: 'सार्वजनिक जानकारी के लिए समीक्षा की गई सेवाएँ। समय निर्धारण और भुगतान अभी सक्रिय नहीं हैं।',
  loading: 'उपलब्ध सूचियाँ लोड हो रही हैं…', retry: 'फिर प्रयास करें', privacyPolicy: 'गोपनीयता नीति', empty: 'इस भाषा में अभी कोई स्वीकृत सूची उपलब्ध नहीं है।',
  catalogError: 'फिलहाल सूची उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।', details: 'विवरण देखें',
  listingTypeProduct: 'उत्पाद', listingTypeService: 'सेवा', priceOnRequest: 'जानकारी के लिए संपर्क करें', listedAmount: 'सूचीबद्ध राशि',
  backToShop: 'वापस जाएँ', inquiryNotice: 'यह केवल पूछताछ है, बुकिंग या भुगतान नहीं। उपलब्धता और अंतिम विवरण की पुष्टि कर्मचारी करेंगे।',
  contactTitle: 'प्राची धाम फाउंडेशन से संपर्क करें', contactLead: 'वर्तमान कार्यक्रम, सेवाओं और उत्पाद उपलब्धता के लिए फाउंडेशन द्वारा दिए गए संपर्क माध्यमों पर बात करें।',
  emailLabel: 'ईमेल', phoneLabel: 'फ़ोन', locationLabel: 'स्थान', contactNote: 'ईमेल से कार्ड का विवरण या संवेदनशील पारिवारिक जानकारी न भेजें।',
  staffCatalog: 'सूची प्रबंधन',
  inquiryName: 'आपका नाम', inquiryEmail: 'ईमेल पता', inquiryConsent: 'मैंने गोपनीयता नीति पढ़ी है और इस पूछताछ के लिए संपर्क करने की सहमति देता/देती हूँ।',
  inquirySend: 'उपलब्धता पूछें', inquirySuccess: 'आपकी पूछताछ प्राप्त हो गई है। कोई भुगतान नहीं लिया गया।', inquiryError: 'अनुरोध भेजा नहीं जा सका। कृपया बाद में फिर प्रयास करें।',
  inquiryQuantity: 'मात्रा', inquiryContact: 'इस सूची के बारे में पूछें',
};

const gu: Messages = {
  brandSubheading: 'ફાઉન્ડેશન · ગીર સોમનાથ',
  skip: 'મુખ્ય વિષયવસ્તુ પર જાઓ', navLabel: 'મુખ્ય નેવિગેશન', home: 'મુખ્ય પાનું', shop: 'ઉત્પાદનો', services: 'સેવાઓ', contact: 'સંપર્ક', staff: 'સ્ટાફ પ્રવેશ', language: 'ભાષા',
  kicker: 'પ્રાચી તીર્થ · ગુજરાત', heroTitle: 'પરંપરામાં મૂળ.', heroAccent: 'સેવામાં આગળ.',
  heroLead: 'પ્રાચી ધામ ફાઉન્ડેશન ગીર સોમનાથમાં પોતાના કાર્ય, સેવાઓ અને સામુદાયિક પહેલ વિશે માહિતી વહેંચવા આ સ્થાન તૈયાર કરી રહ્યું છે.',
  heroAction: 'હેતુ વિશે જાણો', reviewNote: 'ફાઉન્ડેશનની સમીક્ષા પછી જ સેવા ઉપલબ્ધતા અને જાહેર યાદી દર્શાવવામાં આવશે.',
  aboutIndex: '01 / ફાઉન્ડેશન', aboutLabel: 'અમારો હેતુ', aboutTitle: 'સેવાના અનેક માર્ગ, એક સંકલ્પ.',
  aboutBody: 'ફાઉન્ડેશનના જાહેર કરેલા હેતુઓમાં સંસ્કૃતિનું સંરક્ષણ, શિક્ષણ, સમાજ કલ્યાણ, પશુ સંભાળ અને પર્યાવરણ સંરક્ષણ સામેલ છે. કાર્યરત કાર્યક્રમોની વિગતો ચકાસણી પછી પ્રકાશિત થશે.',
  offeringsIndex: '02 / શોધો', offeringsLabel: 'જાણો', offeringsTitle: 'સેવાઓ અને ઉત્પાદનોની સ્પષ્ટ માહિતી.',
  offeringsBody: 'માત્ર સમીક્ષા પછી પ્રકાશિત યાદીઓ જુઓ. ઉત્પાદનની કિંમત અને સેવાની ઉપલબ્ધતા અલગથી સંચાલિત થાય છે; પૂછપરછ એ ચુકવણી કે બુકિંગ નથી.',
  shopAction: 'ઉત્પાદનો જુઓ', servicesAction: 'સેવાઓ જુઓ', updatesLabel: 'જોડાઓ', updatesTitle: 'વાતચીતની શરૂઆત કરો.',
  updatesBody: 'હાલના કાર્યક્રમો અથવા કોઈ સેવા વિશે ફાઉન્ડેશનને પૂછો. સંવેદનશીલ કુટુંબ અથવા ચુકવણી માહિતી ઇમેઇલમાં ન મોકલો.',
  contactAction: 'ફાઉન્ડેશનનો સંપર્ક કરો', footerLocation: 'પ્રાચી તીર્થ · ગીર સોમનાથ, ગુજરાત',
  shopTitle: 'ઉત્પાદનો અને ઓફરો', shopLead: 'સમીક્ષા પછી પ્રકાશિત ઉત્પાદનો અને દર્શાવેલ રકમ. ઓર્ડર અને ચુકવણી હજી સક્રિય નથી.',
  servicesTitle: 'સેવાઓ', servicesLead: 'જાહેર માહિતી માટે સમીક્ષા કરેલી સેવાઓ. સમય નિર્ધારણ અને ચુકવણી હજી સક્રિય નથી.',
  loading: 'ઉપલબ્ધ યાદીઓ લોડ થઈ રહી છે…', retry: 'ફરી પ્રયત્ન કરો', privacyPolicy: 'ગોપનીયતા નીતિ', empty: 'આ ભાષામાં હજી કોઈ મંજૂર યાદી ઉપલબ્ધ નથી.',
  catalogError: 'હાલમાં યાદી ઉપલબ્ધ નથી. કૃપા કરીને પછી ફરી પ્રયાસ કરો.', details: 'વિગતો જુઓ',
  listingTypeProduct: 'ઉત્પાદન', listingTypeService: 'સેવા', priceOnRequest: 'વિગતો માટે સંપર્ક કરો', listedAmount: 'દર્શાવેલ રકમ',
  backToShop: 'પાછા જાઓ', inquiryNotice: 'આ માત્ર પૂછપરછ છે, બુકિંગ કે ચુકવણી નથી. ઉપલબ્ધતા અને અંતિમ વિગતોની સ્ટાફ પુષ્ટિ જરૂરી છે.',
  contactTitle: 'પ્રાચી ધામ ફાઉન્ડેશનનો સંપર્ક કરો', contactLead: 'હાલના કાર્યક્રમો, સેવાઓ અને ઉત્પાદન ઉપલબ્ધતા માટે ફાઉન્ડેશન દ્વારા આપેલી સંપર્ક માહિતીનો ઉપયોગ કરો.',
  emailLabel: 'ઇમેઇલ', phoneLabel: 'ફોન', locationLabel: 'સ્થળ', contactNote: 'ઇમેઇલમાં કાર્ડ વિગતો અથવા સંવેદનશીલ કુટુંબ માહિતી મોકલશો નહીં.',
  staffCatalog: 'યાદી સંચાલન',
  inquiryName: 'તમારું નામ', inquiryEmail: 'ઇમેઇલ સરનામું', inquiryConsent: 'મેં ગોપનીયતા નીતિ વાંચી છે અને આ પૂછપરછ વિશે સંપર્ક માટે સંમતિ આપું છું.',
  inquirySend: 'ઉપલબ્ધતા પૂછો', inquirySuccess: 'તમારી પૂછપરછ મળી છે. કોઈ ચુકવણી લેવામાં આવી નથી.', inquiryError: 'વિનંતી મોકલી શકાઈ નથી. કૃપા કરીને પછી ફરી પ્રયાસ કરો.',
  inquiryQuantity: 'જથ્થો', inquiryContact: 'આ યાદી વિશે પૂછો',
};

export const messages: Record<Locale, Messages> = { gu, hi, en };
export function getMessages(locale: Locale): Messages { return messages[locale]; }
export const languageNames: Record<Locale, string> = { gu: 'ગુજરાતી', hi: 'हिन्दी', en: 'English' };
