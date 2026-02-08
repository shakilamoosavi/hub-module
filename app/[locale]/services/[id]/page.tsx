"use client";
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from "react";
import Link from 'next/link';

// Mock service detail (match list page mock)
const mockLangs = ['en', 'fa', 'ar'] as const;
type Lang = typeof mockLangs[number];
const mockName = {
  en: (n: number) => `Dr. Mehdi Ghazi`,
  fa: (n: number) => `دکتر مهدی قاضی`,
  ar: (n: number) => `د. مهدي قاضي`
};
const mockDescription = {
  en: (n: number) => `Specialist in Urology`,
  fa: (n: number) => `متخصص اورولوژی`,
  ar: (n: number) => `أخصائي في المسالك البولية`
};
const mockAddress = {
  en: (n: number) => `Azadehshahr, between Milad and Esteghlal 4 crossroads, No. 44, First Floor`,
  fa: (n: number) => `آزادشهر، بین چهارراه میلاد و استقلال 4 ،پلاک 44 ، طبقه اول`,
  ar: (n: number) => `آزادشهر، بين تقاطعي ميلاد واستقلال 4، رقم 44، الطابق الأول`
};
const mockFirstAvailableAppointment = {
  en: (n: number) => `Saturday, 14 February`,
  fa: (n: number) => `شنبه 25 بهمن`,
  ar: (n: number) => `السبت 14 فبراير`
};
const mockFacilities = [
  {
    en: (n: number) => `Insurance coverage`,
    fa: (n: number) => `پوشش دهی بیمه`,
    ar: (n: number) => `تغطية التأمين`
  },
  {
    en: (n: number) => `Minimum waiting time`,
    fa: (n: number) => `کمترین معطلی`,
    ar: (n: number) => `أقل انتظار`
  }
]

// const mockDescription = {
//   en: (n: number) => ``,
//   fa: (n: number) => ` 

// · جراح و متخصص ناباروری و دستگاه تناسلی مردان 

// · عضو سازمان نظام پزشکی و کالج جراحان انگلستان 

// · عضو جامعه جراحان و انجمن اورولوژی ایران و مشهد 

// · دوره ی تکمیلی ارولوژی در بریتانیا 

// خدمات مرکز اورولوژی دکتر مهدی قاضی
// :  

// تشخیص و درمان 

// · بیماریهای کلیه,مثانه,پروستات,سنگ های
// ادراری,سرطان های سیستم ادراری تناسلی,بیماری های بیضه، فتق و واریکوسل,ناباروری
// مردان,بی اختیاری ادراری آقایان و بانوان,درمان ناتوانی جنسی (اختلال نعوظ و
// زودانزالی ) 

// · خدمات جراحی باز و بسته /لیزر و جراحی
// میکروسکوپیک سیستم ادراری تناسلی 

// · درمان زگیل تناسلی آقایان و بانوان :لیزر
// ,کرایوتراپی و پلاسما تراپی 

// آلت تناسلی آقایان 

// · افزایش سایز آلت تناسلی  

// · درمان کجی آلت و پلاک پیرونی 

// · جوان سازی آلت با پی آر پی و شاکویو 

// · ختنه به روش کلاسیک جراحی و رینگ 

// خدمات تخصصی اورولوژی بانوان 

// · لیزر خشکی و آتروفی واژن 

// · لیزر بی اختیاری ادراری بانوان 

// معاینات زنان و اقدامات درمانی مربوط
// به آن توسط دستیار پزشک خانم صورت می پذیرد `,
//   ar: (n: number) => ``
// }

function generateMockService(locale: Lang) {
  return {
    name: mockName,
    description: mockDescription,
    address: mockAddress,
    firstAvailableAppointment: mockFirstAvailableAppointment,
    facilities: mockFacilities,
    // description: mockDas
  };
}

export default function ServiceDetailPage({ params }: { params: Promise<{ id: number, locale: Lang }> }) {
  const { id, locale } = React.use(params);
  const t = useTranslations();
  const service = generateMockService(locale);

  const handleReserve = () => {
    alert(t('services.reserved'));
  };

  return (
    <div className="pt-24 max-w-7xl w-full mx-auto my-10 flex flex-col md:flex-row gap-8">
      {/*  part: 1/3 width */}
      <div className="w-full md:w-1/3 flex-shrink-0">
        <div className="p-4 border rounded-2xl border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-4 pb-2">
            <img
              src="https://statics.doctoreto.com/resize:fill:180:180:0/gravity:sm/format:webp/plain/s3://drto/avatar/doctor/2022/11/DyBGyti9hAuXCG77VN8tCJIq3p09TanMw6eqXcyT.jpg"
              alt="doctor avatar"
              className="w-20 h-20 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{service.name[locale]}</div>
              <div className="text-sm text-gray-500 truncate">{service.description[locale]}</div>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-2xl border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            {/* <div>{t('service.about')}</div> */}
            <div>

            </div>
          </div>
        </div>
        {/* <div className="flex justify-end">
          <Link href={`/${locale}/services`} className="inline-block mb-4 text-blue-600 hover:underline text-sm font-medium">← {t('services.serviceTitle')}</Link>
        </div> */}
      </div>
      {/*  part: 2/3 width */}
      <div className="w-full md:w-2/3">
          
      </div>
    </div>
  );
}
