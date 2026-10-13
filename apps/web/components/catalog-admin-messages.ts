import type { Locale } from '../lib/locales';
const en = {
  title: 'Catalog management', intro: 'Create drafts, review all three translations, then publish. Inquiries are not payments.',
  back: 'Back to staff dashboard', language: 'Interface language', loading: 'Loading secure catalog…', denied: 'An owner or administrator account is required.',
  signIn: 'Sign in to staff portal', error: 'Unable to load catalog. Try again.', retry: 'Retry', create: 'New listing', listings: 'Listings', empty: 'No listings yet.',
  kind: 'Type', product: 'Product', service: 'Service', sku: 'SKU (products only)', amount: 'Listed INR amount (optional for services)',
  save: 'Save listing draft', update: 'Update listing; unpublish for review', busy: 'Saving…', select: 'Select to edit', status: 'Status',
  translation: 'Translation to review', titleField: 'Title', slug: 'URL slug', summary: 'Summary', saveTranslation: 'Save translation draft', approveTranslation: 'Approve reviewed translation',
  publish: 'Publish in all three languages', unpublish: 'Unpublish', publicationNote: 'Publication requires approved English, Hindi and Gujarati text, plus a price for products.',
  inquiries: 'Availability inquiries', inquiriesEmpty: 'No inquiries yet.', contact: 'Contact', items: 'Items', markContacted: 'Mark contacted', close: 'Close',
  operationSuccess: 'Change saved.', invalidAmount: 'Enter a non-negative amount with at most two decimal places.',
};
export type AdminMessages = typeof en;
const hi: AdminMessages = {
  title: 'सूची प्रबंधन', intro: 'ड्राफ्ट बनाएँ, तीनों अनुवादों की समीक्षा करें, फिर प्रकाशित करें। पूछताछ भुगतान नहीं है।',
  back: 'कर्मचारी डैशबोर्ड पर वापस', language: 'इंटरफ़ेस भाषा', loading: 'सुरक्षित सूची लोड हो रही है…', denied: 'स्वामी या प्रशासक खाते की आवश्यकता है।',
  signIn: 'कर्मचारी पोर्टल में प्रवेश', error: 'सूची लोड नहीं हो सकी। पुनः प्रयास करें।', retry: 'पुनः प्रयास', create: 'नई सूची', listings: 'सूचियाँ', empty: 'अभी कोई सूची नहीं है।',
  kind: 'प्रकार', product: 'उत्पाद', service: 'सेवा', sku: 'SKU (केवल उत्पाद)', amount: 'सूचीबद्ध INR राशि (सेवा के लिए वैकल्पिक)',
  save: 'ड्राफ्ट सहेजें', update: 'सूची बदलें; समीक्षा तक अप्रकाशित करें', busy: 'सहेजा जा रहा है…', select: 'संपादन के लिए चुनें', status: 'स्थिति',
  translation: 'समीक्षा हेतु अनुवाद', titleField: 'शीर्षक', slug: 'URL स्लग', summary: 'सारांश', saveTranslation: 'अनुवाद ड्राफ्ट सहेजें', approveTranslation: 'समीक्षित अनुवाद स्वीकृत करें',
  publish: 'तीनों भाषाओं में प्रकाशित करें', unpublish: 'अप्रकाशित करें', publicationNote: 'प्रकाशन के लिए अंग्रेज़ी, हिंदी और गुजराती पाठ की स्वीकृति तथा उत्पाद मूल्य आवश्यक है।',
  inquiries: 'उपलब्धता पूछताछ', inquiriesEmpty: 'अभी कोई पूछताछ नहीं है।', contact: 'संपर्क करें', items: 'आइटम', markContacted: 'संपर्क किया गया', close: 'बंद करें',
  operationSuccess: 'परिवर्तन सहेजा गया।', invalidAmount: 'शून्य या अधिक राशि अधिकतम दो दशमलव अंकों के साथ दर्ज करें।',
};
const gu: AdminMessages = {
  title: 'યાદી સંચાલન', intro: 'ડ્રાફ્ટ બનાવો, ત્રણેય અનુવાદોની સમીક્ષા કરો, પછી પ્રકાશિત કરો. પૂછપરછ એ ચુકવણી નથી.',
  back: 'સ્ટાફ ડૅશબોર્ડ પર પાછા', language: 'ઇન્ટરફેસ ભાષા', loading: 'સુરક્ષિત યાદી લોડ થઈ રહી છે…', denied: 'માલિક અથવા વ્યવસ્થાપક ખાતું જરૂરી છે.',
  signIn: 'સ્ટાફ પોર્ટલમાં પ્રવેશ કરો', error: 'યાદી લોડ થઈ શકી નથી. ફરી પ્રયત્ન કરો.', retry: 'ફરી પ્રયત્ન', create: 'નવી યાદી', listings: 'યાદીઓ', empty: 'હજી કોઈ યાદી નથી.',
  kind: 'પ્રકાર', product: 'ઉત્પાદન', service: 'સેવા', sku: 'SKU (માત્ર ઉત્પાદનો)', amount: 'દર્શાવેલ INR રકમ (સેવા માટે વૈકલ્પિક)',
  save: 'ડ્રાફ્ટ સાચવો', update: 'યાદી સુધારો; સમીક્ષા સુધી અપ્રકાશિત કરો', busy: 'સાચવી રહ્યાં છીએ…', select: 'સુધારવા પસંદ કરો', status: 'સ્થિતિ',
  translation: 'સમીક્ષા માટે અનુવાદ', titleField: 'શીર્ષક', slug: 'URL સ્લગ', summary: 'સારાંશ', saveTranslation: 'અનુવાદ ડ્રાફ્ટ સાચવો', approveTranslation: 'સમીક્ષા કરેલ અનુવાદ મંજૂર કરો',
  publish: 'ત્રણેય ભાષામાં પ્રકાશિત કરો', unpublish: 'અપ્રકાશિત કરો', publicationNote: 'પ્રકાશન માટે મંજૂર અંગ્રેજી, હિન્દી અને ગુજરાતી લખાણ તથા ઉત્પાદન કિંમત જરૂરી છે.',
  inquiries: 'ઉપલબ્ધતા પૂછપરછ', inquiriesEmpty: 'હજી કોઈ પૂછપરછ નથી.', contact: 'સંપર્ક', items: 'વસ્તુઓ', markContacted: 'સંપર્ક થયો', close: 'બંધ કરો',
  operationSuccess: 'ફેરફાર સાચવાયો.', invalidAmount: 'શૂન્ય કે તેથી વધુ રકમ વધુમાં વધુ બે દશાંશ અંકો સાથે દાખલ કરો.',
};
export const adminMessages: Record<Locale, AdminMessages> = { gu, hi, en };
