import type { Locale } from '../lib/locales';

// Staff-facing copy in the same three launch languages as the public site.
// Default interface language is English; the registry stays separate from the
// public dictionary because staff wording is operational, not editorial.
export type StaffMessages = {
  shell: {
    skip: string;
    brandCaption: string;
    navOverview: string;
    navWorkspaces: string;
    navCatalog: string;
    orgEyebrow: string;
    liveApiData: string;
    signOut: string;
    signingOut: string;
    openNavigation: string;
    closeNavigation: string;
    sidebarLabel: string;
    primaryNavigation: string;
    orgContextLabel: string;
    languageLabel: string;
  };
  login: {
    identityLabel: string;
    asideTitle: string;
    asideBody: string;
    footnote: string;
    eyebrow: string;
    title: string;
    body: string;
    emailLabel: string;
    passwordLabel: string;
    signIn: string;
    signingIn: string;
    help: string;
    genericError: string;
  };
  session: {
    checking: string;
    checkError: string;
    dataError: string;
    errorTitle: string;
  };
  overview: {
    loading: string;
    noResponse: string;
    eyebrow: string;
    title: string;
    body: string;
    browse: string;
    totalsLabel: string;
    totalRecords: string;
    totalRecordsCaption: string;
    activeWorkspaces: string;
    activeWorkspacesCaption: string;
    recentUpdates: string;
    recentUpdatesCaption: string;
    recentActivity: string;
    recentActivityBody: string;
    noRecentActivity: string;
    noRecentActivityBody: string;
    updated: (date: string) => string;
    workspaceActivity: string;
    workspaceActivityCount: (count: number) => string;
    noWorkspaceDefinitions: string;
    noRecords: string;
    noRecordsBody: string;
    recordsCount: (count: number) => string;
  };
  modules: {
    loading: string;
    eyebrow: string;
    title: string;
    body: string;
    empty: string;
    emptyBody: string;
    groupFallback: string;
    descriptionFallback: string;
    open: string;
    recordCount: (count: number) => string;
  };
  records: {
    back: string;
    noticeLead: string;
    noticeBody: (name: string) => string;
    searchLabel: (name: string) => string;
    searchPlaceholder: (name: string) => string;
    readOnly: string;
    loading: (name: string) => string;
    noMatching: string;
    noRecords: string;
    noMatchingBody: string;
    noRecordsBody: string;
    updated: (date: string) => string;
    edit: string;
    editAria: (title: string) => string;
    previousPage: string;
    nextPage: string;
    showing: (start: number, end: number, total: number) => string;
    selectRecord: string;
    selectRecordBody: string;
    lastUpdated: string;
    notes: string;
    noNotes: string;
    workflowDecision: string;
    submitForApproval: string;
    approve: string;
    reject: string;
    decisionsRestricted: string;
    noFurtherDecision: string;
    editorCreate: string;
    editorUpdate: string;
    editorScope: string;
    titleField: string;
    statusField: string;
    statusDraft: string;
    statusActive: string;
    statusArchived: string;
    notesField: string;
    optional: string;
    cancel: string;
    save: string;
    closeEditor: string;
    titleRequired: string;
    saveError: string;
    transitionError: string;
    loadError: string;
    actionNewConstituent: string;
    actionNewProgram: string;
    actionNewApproval: string;
    actionNewGrant: string;
    actionNewStaff: string;
    actionNewProfile: string;
    actionNewFinance: string;
    actionNewRecord: string;
  };
  tools: {
    intelligenceEyebrow: string;
    intelligenceTitle: string;
    intelligenceBody: string;
    intelligencePrivacy: string;
    noteTitle: string;
    noteText: string;
    generating: string;
    generate: string;
    briefResult: string;
    intelligenceError: string;
    geoEyebrow: string;
    geoTitle: string;
    geoBody: string;
    pointALat: string;
    pointALon: string;
    pointBLat: string;
    pointBLon: string;
    calculating: string;
    calculate: string;
    distanceResult: string;
    geoError: string;
  };
  states: {
    loadingDefault: string;
    retrieving: string;
    dateUnavailable: string;
    unknown: string;
    errorTitle: string;
    tryAgain: string;
  };
  status: {
    draft: string;
    active: string;
    submitted: string;
    approved: string;
    rejected: string;
    archived: string;
  };
};

const en: StaffMessages = {
  shell: {
    skip: 'Skip to main content',
    brandCaption: 'Operations',
    navOverview: 'Overview',
    navWorkspaces: 'Workspaces',
    navCatalog: 'Catalog',
    orgEyebrow: 'Organization',
    liveApiData: 'Live API data',
    signOut: 'Sign out',
    signingOut: 'Signing out…',
    openNavigation: 'Open navigation',
    closeNavigation: 'Close navigation',
    sidebarLabel: 'Application sidebar',
    primaryNavigation: 'Primary navigation',
    orgContextLabel: 'Organization context',
    languageLabel: 'Interface language',
  },
  login: {
    identityLabel: 'Prachi Dham Foundation identity',
    asideTitle: 'One quiet place for the work that matters.',
    asideBody: 'Secure internal operations for foundation staff, organized by the workspaces your role can access.',
    footnote: 'Internal staff access only',
    eyebrow: 'Staff sign in',
    title: 'Welcome back',
    body: 'Sign in with the account created by your organization administrator.',
    emailLabel: 'Email address',
    passwordLabel: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    help: 'This app uses a secure session cookie. Contact your organization administrator if you do not have staff credentials.',
    genericError: 'Unable to sign in.',
  },
  session: {
    checking: 'Checking your secure staff session.',
    checkError: 'The session could not be checked.',
    dataError: 'Live organization data could not be loaded.',
    errorTitle: 'Unable to verify your session',
  },
  overview: {
    loading: 'Loading totals and recent activity from the organization workspace.',
    noResponse: 'No dashboard response was returned.',
    eyebrow: 'Live overview',
    title: 'Operational home',
    body: 'Accurate activity for your organization, with no seeded records or estimated totals.',
    browse: 'Browse workspaces',
    totalsLabel: 'Live operational totals',
    totalRecords: 'Total records',
    totalRecordsCaption: 'Stored across accessible workspaces',
    activeWorkspaces: 'Active workspaces',
    activeWorkspacesCaption: 'Workspaces with one or more records',
    recentUpdates: 'Recent updates',
    recentUpdatesCaption: 'Items returned by the live activity feed',
    recentActivity: 'Recent activity',
    recentActivityBody: 'Latest records returned by the dashboard service.',
    noRecentActivity: 'No recent activity',
    noRecentActivityBody: 'Records created or updated in accessible workspaces will appear here.',
    updated: (date) => `Updated ${date}`,
    workspaceActivity: 'Workspace activity',
    workspaceActivityCount: (count) => `${count} accessible workspace definitions returned.`,
    noWorkspaceDefinitions: 'No workspace definitions returned.',
    noRecords: 'No records yet',
    noRecordsBody: 'Module totals will appear once records exist.',
    recordsCount: (count) => `${count} ${count === 1 ? 'record' : 'records'}`,
  },
  modules: {
    loading: 'Loading the organization’s accessible workspaces.',
    eyebrow: 'Workspace catalog',
    title: 'Operational domains',
    body: 'Choose a domain to use the common record workspace. Domain-specific suites and specialized workflows are not represented as complete products here.',
    empty: 'No accessible workspaces',
    emptyBody: 'The service did not return any workspace definitions for this account.',
    groupFallback: 'Operational workspace',
    descriptionFallback: 'A shared record workspace for this operational domain.',
    open: 'Open',
    recordCount: (count) => `${count} ${count === 1 ? 'record' : 'records'}`,
  },
  records: {
    back: 'All workspaces',
    noticeLead: 'Common record workspace.',
    noticeBody: (name) => `This foundation supports shared records and workflow actions; it is not a complete ${name} domain suite.`,
    searchLabel: (name) => `Search ${name} records`,
    searchPlaceholder: (name) => `Search ${name} records`,
    readOnly: 'Your role has read-only access to this workspace.',
    loading: (name) => `Loading ${name} records from the organization workspace.`,
    noMatching: 'No matching records',
    noRecords: 'No records yet',
    noMatchingBody: 'Try a different search term or clear the search field.',
    noRecordsBody: 'Create the first record when the organization is ready to begin work in this domain.',
    updated: (date) => `Updated ${date}`,
    edit: 'Edit',
    editAria: (title) => `Edit ${title}`,
    previousPage: 'Previous page',
    nextPage: 'Next page',
    showing: (start, end, total) => `Showing ${start}–${end} of ${total} records`,
    selectRecord: 'Select a record',
    selectRecordBody: 'Choose a record from the list to view its shared workspace details.',
    lastUpdated: 'Last updated',
    notes: 'Workspace notes',
    noNotes: 'No workspace notes recorded.',
    workflowDecision: 'Workflow decision',
    submitForApproval: 'Submit for approval',
    approve: 'Approve',
    reject: 'Reject',
    decisionsRestricted: 'Workflow decisions are available to managers and above.',
    noFurtherDecision: 'No further decision is available for the current status.',
    editorCreate: 'New record',
    editorUpdate: 'Update record',
    editorScope: 'Only common record fields are available in this foundation workspace.',
    titleField: 'Title',
    statusField: 'Status',
    statusDraft: 'Draft',
    statusActive: 'Active',
    statusArchived: 'Archived',
    notesField: 'Workspace notes',
    optional: '(optional)',
    cancel: 'Cancel',
    save: 'Save record',
    closeEditor: 'Close record editor',
    titleRequired: 'A record title is required.',
    saveError: 'The record could not be saved.',
    transitionError: 'The workflow decision could not be saved.',
    loadError: 'The record list could not be loaded.',
    actionNewConstituent: 'New constituent',
    actionNewProgram: 'New program',
    actionNewApproval: 'New approval request',
    actionNewGrant: 'New grant',
    actionNewStaff: 'New staff record',
    actionNewProfile: 'New profile',
    actionNewFinance: 'New finance record',
    actionNewRecord: 'New record',
  },
  tools: {
    intelligenceEyebrow: 'Optional intelligence',
    intelligenceTitle: 'Brief an operational note',
    intelligenceBody: 'Turn a non-sensitive staff note into a concise brief. The AI provider must be configured by an administrator.',
    intelligencePrivacy: 'Do not enter donor, beneficiary, employee, payment or health information. Your text is sent to the configured AI provider.',
    noteTitle: 'Note title',
    noteText: 'Operational note',
    generating: 'Preparing brief…',
    generate: 'Generate brief',
    briefResult: 'Generated brief · Review before use',
    intelligenceError: 'The summary service is unavailable.',
    geoEyebrow: 'Geospatial tool',
    geoTitle: 'Distance between two points',
    geoBody: 'Calculate great-circle distance in kilometers. This is not a road-routing estimate.',
    pointALat: 'Point A latitude',
    pointALon: 'Point A longitude',
    pointBLat: 'Point B latitude',
    pointBLon: 'Point B longitude',
    calculating: 'Calculating…',
    calculate: 'Calculate distance',
    distanceResult: 'Great-circle distance',
    geoError: 'The distance service is unavailable.',
  },
  states: {
    loadingDefault: 'Loading live workspace data',
    retrieving: 'Retrieving data',
    dateUnavailable: 'Date unavailable',
    unknown: 'Unknown',
    errorTitle: 'Unable to load this view',
    tryAgain: 'Try again',
  },
  status: {
    draft: 'Draft',
    active: 'Active',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
    archived: 'Archived',
  },
};

const hi: StaffMessages = {
  shell: {
    skip: 'मुख्य सामग्री पर जाएँ',
    brandCaption: 'संचालन',
    navOverview: 'अवलोकन',
    navWorkspaces: 'कार्यक्षेत्र',
    navCatalog: 'सूची',
    orgEyebrow: 'संस्था',
    liveApiData: 'लाइव API डेटा',
    signOut: 'साइन आउट',
    signingOut: 'साइन आउट हो रहा है…',
    openNavigation: 'नेविगेशन खोलें',
    closeNavigation: 'नेविगेशन बंद करें',
    sidebarLabel: 'एप्लिकेशन साइडबार',
    primaryNavigation: 'मुख्य नेविगेशन',
    orgContextLabel: 'संस्था संदर्भ',
    languageLabel: 'इंटरफ़ेस भाषा',
  },
  login: {
    identityLabel: 'प्राची धाम फाउंडेशन पहचान',
    asideTitle: 'महत्वपूर्ण कार्य के लिए एक शांत स्थान।',
    asideBody: 'फाउंडेशन कर्मचारियों के लिए सुरक्षित आंतरिक संचालन, आपकी भूमिका के अनुसार कार्यक्षेत्रों में व्यवस्थित।',
    footnote: 'केवल आंतरिक कर्मचारी प्रवेश',
    eyebrow: 'कर्मचारी साइन इन',
    title: 'पुनः स्वागत है',
    body: 'अपने संस्था प्रशासक द्वारा बनाए गए खाते से साइन इन करें।',
    emailLabel: 'ईमेल पता',
    passwordLabel: 'पासवर्ड',
    signIn: 'साइन इन',
    signingIn: 'साइन इन हो रहा है…',
    help: 'यह ऐप सुरक्षित सत्र कुकी का उपयोग करता है। कर्मचारी क्रेडेंशियल न होने पर अपने संस्था प्रशासक से संपर्क करें।',
    genericError: 'साइन इन नहीं हो सका।',
  },
  session: {
    checking: 'आपका सुरक्षित कर्मचारी सत्र जाँचा जा रहा है।',
    checkError: 'सत्र की जाँच नहीं हो सकी।',
    dataError: 'लाइव संस्था डेटा लोड नहीं हो सका।',
    errorTitle: 'आपका सत्र सत्यापित नहीं हो सका',
  },
  overview: {
    loading: 'संस्था कार्यक्षेत्र से कुल और हाल की गतिविधि लोड हो रही है।',
    noResponse: 'कोई डैशबोर्ड प्रतिक्रिया नहीं मिली।',
    eyebrow: 'लाइव अवलोकन',
    title: 'संचालन केंद्र',
    body: 'आपकी संस्था के लिए सटीक गतिविधि, बिना किसी नकली रिकॉर्ड या अनुमानित कुल के।',
    browse: 'कार्यक्षेत्र देखें',
    totalsLabel: 'लाइव संचालन कुल',
    totalRecords: 'कुल रिकॉर्ड',
    totalRecordsCaption: 'सुलभ कार्यक्षेत्रों में संग्रहीत',
    activeWorkspaces: 'सक्रिय कार्यक्षेत्र',
    activeWorkspacesCaption: 'एक या अधिक रिकॉर्ड वाले कार्यक्षेत्र',
    recentUpdates: 'हाल के अद्यतन',
    recentUpdatesCaption: 'लाइव गतिविधि फ़ीड से लौटी प्रविष्टियाँ',
    recentActivity: 'हाल की गतिविधि',
    recentActivityBody: 'डैशबोर्ड सेवा से लौटे नवीनतम रिकॉर्ड।',
    noRecentActivity: 'कोई हाल की गतिविधि नहीं',
    noRecentActivityBody: 'सुलभ कार्यक्षेत्रों में बनाए या अद्यतन किए गए रिकॉर्ड यहाँ दिखेंगे।',
    updated: (date) => `${date} को अद्यतन`,
    workspaceActivity: 'कार्यक्षेत्र गतिविधि',
    workspaceActivityCount: (count) => `${count} सुलभ कार्यक्षेत्र परिभाषाएँ लौटीं।`,
    noWorkspaceDefinitions: 'कोई कार्यक्षेत्र परिभाषा नहीं लौटी।',
    noRecords: 'अभी कोई रिकॉर्ड नहीं',
    noRecordsBody: 'रिकॉर्ड बनने पर मॉड्यूल कुल यहाँ दिखेंगे।',
    recordsCount: (count) => `${count} रिकॉर्ड`,
  },
  modules: {
    loading: 'संस्था के सुलभ कार्यक्षेत्र लोड हो रहे हैं।',
    eyebrow: 'कार्यक्षेत्र सूची',
    title: 'संचालन क्षेत्र',
    body: 'साझा रिकॉर्ड कार्यक्षेत्र उपयोग करने के लिए एक क्षेत्र चुनें। विशिष्ट सुइट्स और विशेष वर्कफ़्लो यहाँ पूर्ण उत्पादों के रूप में प्रस्तुत नहीं हैं।',
    empty: 'कोई सुलभ कार्यक्षेत्र नहीं',
    emptyBody: 'सेवा ने इस खाते के लिए कोई कार्यक्षेत्र परिभाषा नहीं लौटाई।',
    groupFallback: 'संचालन कार्यक्षेत्र',
    descriptionFallback: 'इस संचालन क्षेत्र के लिए एक साझा रिकॉर्ड कार्यक्षेत्र।',
    open: 'खोलें',
    recordCount: (count) => `${count} रिकॉर्ड`,
  },
  records: {
    back: 'सभी कार्यक्षेत्र',
    noticeLead: 'साझा रिकॉर्ड कार्यक्षेत्र।',
    noticeBody: (name) => `यह फाउंडेशन साझा रिकॉर्ड और वर्कफ़्लो क्रियाओं का समर्थन करता है; यह पूर्ण ${name} सुइट नहीं है।`,
    searchLabel: (name) => `${name} रिकॉर्ड खोजें`,
    searchPlaceholder: (name) => `${name} रिकॉर्ड खोजें`,
    readOnly: 'आपकी भूमिका के पास इस कार्यक्षेत्र में केवल पढ़ने की पहुँच है।',
    loading: (name) => `संस्था कार्यक्षेत्र से ${name} रिकॉर्ड लोड हो रहे हैं।`,
    noMatching: 'कोई मेल खाता रिकॉर्ड नहीं',
    noRecords: 'अभी कोई रिकॉर्ड नहीं',
    noMatchingBody: 'कोई अन्य खोज शब्द आज़माएँ या खोज फ़ील्ड साफ़ करें।',
    noRecordsBody: 'जब संस्था इस क्षेत्र में कार्य शुरू करने के लिए तैयार हो, पहला रिकॉर्ड बनाएँ।',
    updated: (date) => `${date} को अद्यतन`,
    edit: 'संपादित करें',
    editAria: (title) => `${title} संपादित करें`,
    previousPage: 'पिछला पृष्ठ',
    nextPage: 'अगला पृष्ठ',
    showing: (start, end, total) => `${total} रिकॉर्ड में से ${start}–${end} दिखाए जा रहे हैं`,
    selectRecord: 'एक रिकॉर्ड चुनें',
    selectRecordBody: 'इसके साझा कार्यक्षेत्र विवरण देखने के लिए सूची से एक रिकॉर्ड चुनें।',
    lastUpdated: 'अंतिम अद्यतन',
    notes: 'कार्यक्षेत्र नोट्स',
    noNotes: 'कोई कार्यक्षेत्र नोट दर्ज नहीं।',
    workflowDecision: 'वर्कफ़्लो निर्णय',
    submitForApproval: 'स्वीकृति हेतु भेजें',
    approve: 'स्वीकृत करें',
    reject: 'अस्वीकार करें',
    decisionsRestricted: 'वर्कफ़्लो निर्णय प्रबंधकों और उनसे ऊपर के लिए उपलब्ध हैं।',
    noFurtherDecision: 'वर्तमान स्थिति के लिए कोई और निर्णय उपलब्ध नहीं।',
    editorCreate: 'नया रिकॉर्ड',
    editorUpdate: 'रिकॉर्ड अद्यतन करें',
    editorScope: 'इस फाउंडेशन कार्यक्षेत्र में केवल सामान्य रिकॉर्ड फ़ील्ड उपलब्ध हैं।',
    titleField: 'शीर्षक',
    statusField: 'स्थिति',
    statusDraft: 'ड्राफ्ट',
    statusActive: 'सक्रिय',
    statusArchived: 'संग्रहीत',
    notesField: 'कार्यक्षेत्र नोट्स',
    optional: '(वैकल्पिक)',
    cancel: 'रद्द करें',
    save: 'रिकॉर्ड सहेजें',
    closeEditor: 'रिकॉर्ड संपादक बंद करें',
    titleRequired: 'रिकॉर्ड शीर्षक आवश्यक है।',
    saveError: 'रिकॉर्ड सहेजा नहीं जा सका।',
    transitionError: 'वर्कफ़्लो निर्णय सहेजा नहीं जा सका।',
    loadError: 'रिकॉर्ड सूची लोड नहीं हो सकी।',
    actionNewConstituent: 'नया संबंधित व्यक्ति',
    actionNewProgram: 'नया कार्यक्रम',
    actionNewApproval: 'नया स्वीकृति अनुरोध',
    actionNewGrant: 'नया अनुदान',
    actionNewStaff: 'नया कर्मचारी रिकॉर्ड',
    actionNewProfile: 'नई प्रोफ़ाइल',
    actionNewFinance: 'नया वित्त रिकॉर्ड',
    actionNewRecord: 'नया रिकॉर्ड',
  },
  tools: {
    intelligenceEyebrow: 'वैकल्पिक इंटेलिजेंस',
    intelligenceTitle: 'संचालन नोट का सारांश बनाएँ',
    intelligenceBody: 'एक गैर-संवेदनशील कर्मचारी नोट को संक्षिप्त सारांश में बदलें। AI प्रदाता को प्रशासक द्वारा कॉन्फ़िगर किया जाना चाहिए।',
    intelligencePrivacy: 'दाता, लाभार्थी, कर्मचारी, भुगतान या स्वास्थ्य जानकारी दर्ज न करें। आपका पाठ कॉन्फ़िगर किए गए AI प्रदाता को भेजा जाता है।',
    noteTitle: 'नोट शीर्षक',
    noteText: 'संचालन नोट',
    generating: 'सारांश तैयार हो रहा है…',
    generate: 'सारांश बनाएँ',
    briefResult: 'तैयार सारांश · उपयोग से पहले समीक्षा करें',
    intelligenceError: 'सारांश सेवा उपलब्ध नहीं है।',
    geoEyebrow: 'भू-स्थानिक उपकरण',
    geoTitle: 'दो बिंदुओं के बीच दूरी',
    geoBody: 'किलोमीटर में महान-वृत्त दूरी की गणना करें। यह सड़क-मार्ग अनुमान नहीं है।',
    pointALat: 'बिंदु A अक्षांश',
    pointALon: 'बिंदु A देशांतर',
    pointBLat: 'बिंदु B अक्षांश',
    pointBLon: 'बिंदु B देशांतर',
    calculating: 'गणना हो रही है…',
    calculate: 'दूरी की गणना करें',
    distanceResult: 'महान-वृत्त दूरी',
    geoError: 'दूरी सेवा उपलब्ध नहीं है।',
  },
  states: {
    loadingDefault: 'लाइव कार्यक्षेत्र डेटा लोड हो रहा है',
    retrieving: 'डेटा प्राप्त हो रहा है',
    dateUnavailable: 'तिथि अनुपलब्ध',
    unknown: 'अज्ञात',
    errorTitle: 'यह दृश्य लोड नहीं हो सका',
    tryAgain: 'पुनः प्रयास करें',
  },
  status: {
    draft: 'ड्राफ्ट',
    active: 'सक्रिय',
    submitted: 'प्रस्तुत',
    approved: 'स्वीकृत',
    rejected: 'अस्वीकृत',
    archived: 'संग्रहीत',
  },
};

const gu: StaffMessages = {
  shell: {
    skip: 'મુખ્ય વિષયવસ્તુ પર જાઓ',
    brandCaption: 'સંચાલન',
    navOverview: 'ઝલક',
    navWorkspaces: 'કાર્યક્ષેત્રો',
    navCatalog: 'યાદી',
    orgEyebrow: 'સંસ્થા',
    liveApiData: 'લાઇવ API ડેટા',
    signOut: 'સાઇન આઉટ',
    signingOut: 'સાઇન આઉટ થઈ રહ્યું છે…',
    openNavigation: 'નેવિગેશન ખોલો',
    closeNavigation: 'નેવિગેશન બંધ કરો',
    sidebarLabel: 'એપ્લિકેશન સાઇડબાર',
    primaryNavigation: 'મુખ્ય નેવિગેશન',
    orgContextLabel: 'સંસ્થા સંદર્ભ',
    languageLabel: 'ઇન્ટરફેસ ભાષા',
  },
  login: {
    identityLabel: 'પ્રાચી ધામ ફાઉન્ડેશન ઓળખ',
    asideTitle: 'મહત્ત્વના કાર્ય માટે એક શાંત સ્થાન.',
    asideBody: 'ફાઉન્ડેશન સ્ટાફ માટે સુરક્ષિત આંતરિક સંચાલન, તમારી ભૂમિકા મુજબના કાર્યક્ષેત્રોમાં ગોઠવેલ.',
    footnote: 'માત્ર આંતરિક સ્ટાફ પ્રવેશ',
    eyebrow: 'સ્ટાફ સાઇન ઇન',
    title: 'પુનઃ સ્વાગત',
    body: 'તમારા સંસ્થા વ્યવસ્થાપક દ્વારા બનાવેલા ખાતાથી સાઇન ઇન કરો.',
    emailLabel: 'ઇમેઇલ સરનામું',
    passwordLabel: 'પાસવર્ડ',
    signIn: 'સાઇન ઇન',
    signingIn: 'સાઇન ઇન થઈ રહ્યું છે…',
    help: 'આ એપ સુરક્ષિત સેશન કૂકી વાપરે છે. સ્ટાફ ક્રેડેન્શિયલ ન હોય તો તમારા સંસ્થા વ્યવસ્થાપકનો સંપર્ક કરો.',
    genericError: 'સાઇન ઇન થઈ શક્યું નથી.',
  },
  session: {
    checking: 'તમારું સુરક્ષિત સ્ટાફ સેશન તપાસાઈ રહ્યું છે.',
    checkError: 'સેશન તપાસી શકાયું નથી.',
    dataError: 'લાઇવ સંસ્થા ડેટા લોડ થઈ શક્યો નથી.',
    errorTitle: 'તમારું સેશન ચકાસી શકાયું નથી',
  },
  overview: {
    loading: 'સંસ્થા કાર્યક્ષેત્રમાંથી કુલ અને તાજેતરની પ્રવૃત્તિ લોડ થઈ રહી છે.',
    noResponse: 'કોઈ ડેશબોર્ડ પ્રતિસાદ મળ્યો નથી.',
    eyebrow: 'લાઇવ ઝલક',
    title: 'સંચાલન કેન્દ્ર',
    body: 'તમારી સંસ્થા માટે સચોટ પ્રવૃત્તિ, કોઈ નકલી રેકોર્ડ કે અંદાજિત કુલ વગર.',
    browse: 'કાર્યક્ષેત્રો જુઓ',
    totalsLabel: 'લાઇવ સંચાલન કુલ',
    totalRecords: 'કુલ રેકોર્ડ',
    totalRecordsCaption: 'સુલભ કાર્યક્ષેત્રોમાં સંગ્રહિત',
    activeWorkspaces: 'સક્રિય કાર્યક્ષેત્રો',
    activeWorkspacesCaption: 'એક કે વધુ રેકોર્ડ ધરાવતાં કાર્યક્ષેત્રો',
    recentUpdates: 'તાજેતરના અદ્યતન',
    recentUpdatesCaption: 'લાઇવ પ્રવૃત્તિ ફીડમાંથી મળેલી પ્રવિષ્ટિઓ',
    recentActivity: 'તાજેતરની પ્રવૃત્તિ',
    recentActivityBody: 'ડેશબોર્ડ સેવામાંથી મળેલા નવીનતમ રેકોર્ડ.',
    noRecentActivity: 'કોઈ તાજેતરની પ્રવૃત્તિ નથી',
    noRecentActivityBody: 'સુલભ કાર્યક્ષેત્રોમાં બનાવેલા કે અદ્યતન કરેલા રેકોર્ડ અહીં દેખાશે.',
    updated: (date) => `${date} ના રોજ અદ્યતન`,
    workspaceActivity: 'કાર્યક્ષેત્ર પ્રવૃત્તિ',
    workspaceActivityCount: (count) => `${count} સુલભ કાર્યક્ષેત્ર વ્યાખ્યાઓ મળી.`,
    noWorkspaceDefinitions: 'કોઈ કાર્યક્ષેત્ર વ્યાખ્યા મળી નથી.',
    noRecords: 'હજી કોઈ રેકોર્ડ નથી',
    noRecordsBody: 'રેકોર્ડ બન્યા પછી મોડ્યુલ કુલ અહીં દેખાશે.',
    recordsCount: (count) => `${count} રેકોર્ડ`,
  },
  modules: {
    loading: 'સંસ્થાના સુલભ કાર્યક્ષેત્રો લોડ થઈ રહ્યાં છે.',
    eyebrow: 'કાર્યક્ષેત્ર યાદી',
    title: 'સંચાલન ક્ષેત્રો',
    body: 'સામાન્ય રેકોર્ડ કાર્યક્ષેત્ર વાપરવા એક ક્ષેત્ર પસંદ કરો. વિશિષ્ટ સ્યુટ અને ખાસ વર્કફ્લો અહીં પૂર્ણ ઉત્પાદન તરીકે દર્શાવેલા નથી.',
    empty: 'કોઈ સુલભ કાર્યક્ષેત્ર નથી',
    emptyBody: 'સેવાએ આ ખાતા માટે કોઈ કાર્યક્ષેત્ર વ્યાખ્યા પરત આપી નથી.',
    groupFallback: 'સંચાલન કાર્યક્ષેત્ર',
    descriptionFallback: 'આ સંચાલન ક્ષેત્ર માટે એક સામાન્ય રેકોર્ડ કાર્યક્ષેત્ર.',
    open: 'ખોલો',
    recordCount: (count) => `${count} રેકોર્ડ`,
  },
  records: {
    back: 'બધાં કાર્યક્ષેત્રો',
    noticeLead: 'સામાન્ય રેકોર્ડ કાર્યક્ષેત્ર.',
    noticeBody: (name) => `આ ફાઉન્ડેશન સામાન્ય રેકોર્ડ અને વર્કફ્લો ક્રિયાઓને સપોર્ટ કરે છે; તે પૂર્ણ ${name} સ્યુટ નથી.`,
    searchLabel: (name) => `${name} રેકોર્ડ શોધો`,
    searchPlaceholder: (name) => `${name} રેકોર્ડ શોધો`,
    readOnly: 'તમારી ભૂમિકાને આ કાર્યક્ષેત્રમાં માત્ર વાંચનની પહોંચ છે.',
    loading: (name) => `સંસ્થા કાર્યક્ષેત્રમાંથી ${name} રેકોર્ડ લોડ થઈ રહ્યા છે.`,
    noMatching: 'કોઈ મેળ ખાતો રેકોર્ડ નથી',
    noRecords: 'હજી કોઈ રેકોર્ડ નથી',
    noMatchingBody: 'બીજો શોધ શબ્દ અજમાવો અથવા શોધ ફીલ્ડ સાફ કરો.',
    noRecordsBody: 'સંસ્થા આ ક્ષેત્રમાં કામ શરૂ કરવા તૈયાર થાય ત્યારે પ્રથમ રેકોર્ડ બનાવો.',
    updated: (date) => `${date} ના રોજ અદ્યતન`,
    edit: 'સંપાદિત કરો',
    editAria: (title) => `${title} સંપાદિત કરો`,
    previousPage: 'અગાઉનું પાનું',
    nextPage: 'આગળનું પાનું',
    showing: (start, end, total) => `${total} રેકોર્ડમાંથી ${start}–${end} દર્શાવાઈ રહ્યા છે`,
    selectRecord: 'એક રેકોર્ડ પસંદ કરો',
    selectRecordBody: 'તેની સામાન્ય કાર્યક્ષેત્ર વિગતો જોવા યાદીમાંથી એક રેકોર્ડ પસંદ કરો.',
    lastUpdated: 'છેલ્લે અદ્યતન',
    notes: 'કાર્યક્ષેત્ર નોંધ',
    noNotes: 'કોઈ કાર્યક્ષેત્ર નોંધ નોંધાઈ નથી.',
    workflowDecision: 'વર્કફ્લો નિર્ણય',
    submitForApproval: 'મંજૂરી માટે મોકલો',
    approve: 'મંજૂર કરો',
    reject: 'નકારો',
    decisionsRestricted: 'વર્કફ્લો નિર્ણય મેનેજર અને તેથી ઉપરના સ્તર માટે ઉપલબ્ધ છે.',
    noFurtherDecision: 'વર્તમાન સ્થિતિ માટે બીજો કોઈ નિર્ણય ઉપલબ્ધ નથી.',
    editorCreate: 'નવો રેકોર્ડ',
    editorUpdate: 'રેકોર્ડ અદ્યતન કરો',
    editorScope: 'આ ફાઉન્ડેશન કાર્યક્ષેત્રમાં માત્ર સામાન્ય રેકોર્ડ ફીલ્ડ ઉપલબ્ધ છે.',
    titleField: 'શીર્ષક',
    statusField: 'સ્થિતિ',
    statusDraft: 'ડ્રાફ્ટ',
    statusActive: 'સક્રિય',
    statusArchived: 'સંગ્રહિત',
    notesField: 'કાર્યક્ષેત્ર નોંધ',
    optional: '(વૈકલ્પિક)',
    cancel: 'રદ કરો',
    save: 'રેકોર્ડ સાચવો',
    closeEditor: 'રેકોર્ડ સંપાદક બંધ કરો',
    titleRequired: 'રેકોર્ડ શીર્ષક જરૂરી છે.',
    saveError: 'રેકોર્ડ સાચવી શકાયો નથી.',
    transitionError: 'વર્કફ્લો નિર્ણય સાચવી શકાયો નથી.',
    loadError: 'રેકોર્ડ યાદી લોડ થઈ શકી નથી.',
    actionNewConstituent: 'નવો સંબંધિત વ્યક્તિ',
    actionNewProgram: 'નવો કાર્યક્રમ',
    actionNewApproval: 'નવી મંજૂરી વિનંતી',
    actionNewGrant: 'નવી અનુદાન',
    actionNewStaff: 'નવો સ્ટાફ રેકોર્ડ',
    actionNewProfile: 'નવી પ્રોફાઇલ',
    actionNewFinance: 'નવો નાણાકીય રેકોર્ડ',
    actionNewRecord: 'નવો રેકોર્ડ',
  },
  tools: {
    intelligenceEyebrow: 'વૈકલ્પિક ઇન્ટેલિજન્સ',
    intelligenceTitle: 'સંચાલન નોંધનો સારાંશ બનાવો',
    intelligenceBody: 'બિન-સંવેદનશીલ સ્ટાફ નોંધને સંક્ષિપ્ત સારાંશમાં ફેરવો. AI પ્રદાતા વ્યવસ્થાપક દ્વારા ગોઠવાયેલો હોવો જોઈએ.',
    intelligencePrivacy: 'દાતા, લાભાર્થી, કર્મચારી, ચુકવણી કે આરોગ્ય માહિતી દાખલ ન કરો. તમારું લખાણ ગોઠવેલા AI પ્રદાતાને મોકલાય છે.',
    noteTitle: 'નોંધ શીર્ષક',
    noteText: 'સંચાલન નોંધ',
    generating: 'સારાંશ તૈયાર થઈ રહ્યો છે…',
    generate: 'સારાંશ બનાવો',
    briefResult: 'તૈયાર સારાંશ · વાપરતા પહેલાં સમીક્ષા કરો',
    intelligenceError: 'સારાંશ સેવા ઉપલબ્ધ નથી.',
    geoEyebrow: 'ભૂ-સ્થાનિક સાધન',
    geoTitle: 'બે બિંદુઓ વચ્ચેનું અંતર',
    geoBody: 'કિલોમીટરમાં મહાન-વર્તુળ અંતર ગણો. આ રસ્તા-માર્ગ અંદાજ નથી.',
    pointALat: 'બિંદુ A અક્ષાંશ',
    pointALon: 'બિંદુ A રેખાંશ',
    pointBLat: 'બિંદુ B અક્ષાંશ',
    pointBLon: 'બિંદુ B રેખાંશ',
    calculating: 'ગણતરી થઈ રહી છે…',
    calculate: 'અંતર ગણો',
    distanceResult: 'મહાન-વર્તુળ અંતર',
    geoError: 'અંતર સેવા ઉપલબ્ધ નથી.',
  },
  states: {
    loadingDefault: 'લાઇવ કાર્યક્ષેત્ર ડેટા લોડ થઈ રહ્યો છે',
    retrieving: 'ડેટા મેળવાઈ રહ્યો છે',
    dateUnavailable: 'તારીખ ઉપલબ્ધ નથી',
    unknown: 'અજ્ઞાત',
    errorTitle: 'આ દૃશ્ય લોડ થઈ શક્યું નથી',
    tryAgain: 'ફરી પ્રયાસ કરો',
  },
  status: {
    draft: 'ડ્રાફ્ટ',
    active: 'સક્રિય',
    submitted: 'સબમિટ',
    approved: 'મંજૂર',
    rejected: 'નકારેલ',
    archived: 'સંગ્રહિત',
  },
};

export const staffMessages: Record<Locale, StaffMessages> = { gu, hi, en };
