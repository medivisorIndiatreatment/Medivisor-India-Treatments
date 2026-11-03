import { Metadata } from "next"
import BlogCategoryClient from "./BlogCategoryClient"
import { getLanguageFromCookie } from "@/lib/googleTranslate"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const categoryName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const lang = getLanguageFromCookie()

  const titles: Record<string, string> = {
    en: `${categoryName} | Medivisor India Blog`,
    hi: `${categoryName} | मेडिविसर इंडिया ब्लॉग`,
    ar: `${categoryName} | مديفيزور الهند مدونة`,
    fr: `${categoryName} | Blog Medivisor Inde`,
    es: `${categoryName} | Blog Medivisor India`,
    pt: `${categoryName} | Blog Medivisor Índia`,
    ru: `${categoryName} | Блог Medivisor Индия`,
    'zh-CN': `${categoryName} | Medivisor 印度博客`,
    sw: `${categoryName} | Blogi ya Medivisor India`,
    am: `${categoryName} | ሜዲቪሶር ኢንዲያ ብሎግ`,
    ha: `${categoryName} | Blog na Medivisor India`,
    fa: `${categoryName} | بلاگ مدیویزور هند`,
    ur: `${categoryName} | میڈی ویزر ہند بلاگ`,
    uz: `${categoryName} | Medivisor Hind blogi`,
    bn: `${categoryName} | মেডিভিসর ইন্ডিয়া ব্লগ`,
    de: `${categoryName} | Medivisor Indien Blog`,
    ja: `${categoryName} | Medivisor インド ブログ`,
    it: `${categoryName} | Blog Medivisor India`,
    pl: `${categoryName} | Blog Medivisor Indie`,
    id: `${categoryName} | Blog Medivisor India`,
  }

  const descriptions: Record<string, string> = {
    en: `Browse articles and posts about ${categoryName} from Medivisor India's hospital network.`,
    hi: `मेडिविसर इंडिया के अस्पताल नेटवर्क से ${categoryName} के बारे में लेख और पोस्ट ब्राउज़ करें।`,
    ar: `تصفح المقالات والمنشورات حول ${categoryName} من شبكة مستشفيات مديفيزور الهند.`,
    fr: `Parcourez les articles et les publications sur ${categoryName} du réseau hospitalier de Medivisor India.`,
    es: `Explora artículos y publicaciones sobre ${categoryName} de la red hospitalaria de Medivisor India.`,
    pt: `Navegue por artigos e posts sobre ${categoryName} da rede hospitalar da Medivisor India.`,
    ru: `Просматривайте статьи и публикации о ${categoryName} из больничной сети Medivisor India.`,
    'zh-CN': `浏览 Medivisor India 医院网络中关于 ${categoryName} 的文章和帖子。`,
    sw: `Tafuta makala na machapisho kuhusu ${categoryName} kutoka kwa mtandao wa hospitali ya Medivisor India.`,
    am: `${categoryName} ን ስለ ከ ሜዲቪሶር ኢንዲያ ሆስፒታል ኔትዎርክ እና ልጆች ያስሱ።`,
    ha: `Bincika labarai da wallafafa game da ${categoryName} daga cibiyar asibiti ta Medivisor India.`,
    fa: `مقالات و پست‌های مربوط به ${categoryName} از شبکه بیمارستان‌های مدیویزور هند را مرور کنید.`,
    ur: `میڈی ویزر ہند کے ہسپتال نیٹ ورک سے ${categoryName} کے بارے میں مضامین اور پوسٹس براؤز کریں۔`,
    uz: `Medivisor Hind shifoxona tarmog'idan ${categoryName} haqidagi maqolalar va postlarni ko'rib chiqing.`,
    bn: `মেডিভিসর ইন্ডিয়া হাসপাতাল নেটওয়ার্ক থেকে ${categoryName} সম্পর্কে Статьи এবং পোস্ট ব্রাউজ করুন।`,
    de: `Durchstöbern Sie Artikel und Beiträge über ${categoryName} aus dem Krankenhausnetzwerk von Medivisor India.`,
    ja: `Medivisor India の病院ネットワークから ${categoryName} に関する記事や投稿を閲覧します。`,
    it: `Sfoglia articoli e post su ${categoryName} dalla rete ospedaliera di Medivisor India.`,
    pl: `Przeglądaj artykuły i posty o ${categoryName} z sieci szpitalnej Medivisor India.`,
    id: `Jelajahi artikel dan posting tentang ${categoryName} dari jaringan rumah sakit Medivisor India.`,
  }

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
  }
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { slug } = await params
  
  return <BlogCategoryClient slug={slug} />
}
