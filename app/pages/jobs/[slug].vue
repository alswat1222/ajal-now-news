<script setup lang="ts">
import { MapPin, Building2, Clock, Wallet, CalendarClock, Briefcase } from "lucide-vue-next";

const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ""));

const { data: job, error } = await useFetch(() => `/api/jobs/${slug.value}`);

if (error.value || !job.value) {
  const code = error.value?.statusCode ?? 404;
  throw createError({
    statusCode: code,
    statusMessage: code === 404 ? "Not Found" : "Service Unavailable",
    fatal: true,
  });
}

const j = computed(() => job.value!);
const url = useRequestURL();
const canonical = computed(() => `${url.origin}/jobs/${j.value.slug}`);
const remaining = computed(() => daysLeft(j.value.validThrough));

useSeoMeta({
  title: () => `${j.value.title} — ${j.value.companyName}`,
  description: () => j.value.excerpt,
  ogType: "website",
});

/**
 * JobPosting — يغذّي «Google للوظائف».
 * الحقول الإلزامية: title · description · datePosted · validThrough ·
 * hiringOrganization · jobLocation (أو jobLocationType للعمل عن بُعد).
 * نقص أيٍّ منها يُسقط الإعلان من نتائج الوظائف.
 */
// يُبنى بإسناد صريح لا بتقاطع شرطي: الأخير يُنتج اتحاد أنواع
// لا يقبله توقيع defineJobPosting.
function buildPosting(): Record<string, unknown> {
  const v = j.value;
  const p: Record<string, unknown> = {
    title: v.title,
    description: v.descriptionHtml ?? v.description,
    datePosted: v.postedAt ?? undefined,
    validThrough: v.validThrough,
    employmentType: v.employmentType,
    identifier: { "@type": "PropertyValue", name: v.companyName, value: String(v.id) },
    hiringOrganization: {
      "@type": "Organization",
      name: v.companyName,
      ...(v.companyUrl ? { sameAs: v.companyUrl } : {}),
      ...(v.companyLogo ? { logo: v.companyLogo } : {}),
    },
  };

  // العمل عن بُعد يستعمل jobLocationType لا jobLocation
  if (v.isRemote) {
    p.jobLocationType = "TELECOMMUTE";
    p.applicantLocationRequirements = { "@type": "Country", name: v.country };
  } else {
    p.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(v.city ? { addressLocality: v.city } : {}),
        ...(v.region ? { addressRegion: v.region } : {}),
        addressCountry: v.country,
      },
    };
  }

  // الراتب يُصرَّح به فقط إن كان معلوماً — القيم المخترعة تخالف سياسة Google
  if (v.salaryMin || v.salaryMax) {
    p.baseSalary = {
      "@type": "MonetaryAmount",
      currency: v.salaryCurrency,
      value: {
        "@type": "QuantitativeValue",
        ...(v.salaryMin ? { minValue: v.salaryMin } : {}),
        ...(v.salaryMax ? { maxValue: v.salaryMax } : {}),
        unitText: v.salaryUnit,
      },
    };
  }

  if (v.experienceMonths) {
    p.experienceRequirements = {
      "@type": "OccupationalExperienceRequirements",
      monthsOfExperience: v.experienceMonths,
    };
  }

  // التقديم يتم على موقع الجهة لا عندنا
  if (v.applyUrl) p.directApply = false;

  return p;
}

useSchemaOrg([
  defineJobPosting(buildPosting() as Parameters<typeof defineJobPosting>[0]),
  defineBreadcrumb({
    itemListElement: [
      { name: "الرئيسية", item: "/" },
      { name: "وظائف", item: "/jobs" },
      { name: j.value.title },
    ],
  }),
]);
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-8">
    <nav aria-label="breadcrumb" class="flex items-center gap-2 text-sm text-muted-foreground">
      <NuxtLink to="/" class="hover:text-foreground">الرئيسية</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink to="/jobs" class="font-semibold text-brand-red hover:underline dark:text-brand-red-dark">
        وظائف
      </NuxtLink>
    </nav>

    <header class="mt-5">
      <h1 class="font-headline text-3xl font-extrabold leading-[1.35] md:text-4xl md:leading-[1.3]">
        {{ j.title }}
      </h1>

      <div class="mt-5 grid gap-3 border-y border-border py-4 text-sm sm:grid-cols-2">
        <span class="flex items-center gap-2">
          <Building2 class="h-4 w-4 shrink-0 text-muted-foreground" />
          <a
            v-if="j.companyUrl"
            :href="j.companyUrl"
            target="_blank"
            rel="noopener nofollow"
            class="font-bold hover:underline"
          >{{ j.companyName }}</a>
          <span v-else class="font-bold">{{ j.companyName }}</span>
        </span>
        <span class="flex items-center gap-2">
          <MapPin class="h-4 w-4 shrink-0 text-muted-foreground" />{{ jobLocation(j) }}
        </span>
        <span class="flex items-center gap-2">
          <Clock class="h-4 w-4 shrink-0 text-muted-foreground" />{{ employmentLabel(j.employmentType) }}
        </span>
        <span v-if="j.field" class="flex items-center gap-2">
          <Briefcase class="h-4 w-4 shrink-0 text-muted-foreground" />{{ j.field }}
        </span>
        <span v-if="salaryRange(j)" class="flex items-center gap-2 font-bold text-foreground">
          <Wallet class="h-4 w-4 shrink-0 text-muted-foreground" />{{ salaryRange(j) }}
        </span>
        <span class="flex items-center gap-2">
          <CalendarClock class="h-4 w-4 shrink-0 text-muted-foreground" />
          <span :class="remaining <= 3 ? 'font-bold text-brand-red dark:text-brand-red-dark' : ''">
            {{ remaining === 0 ? "ينتهي اليوم" : `يتبقّى ${remaining} يوماً` }}
          </span>
        </span>
      </div>
    </header>

    <!-- الوصف: HTML مُعقَّم على الخادم -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="j.descriptionHtml" class="article-body mt-8" v-html="j.descriptionHtml" />

    <!-- الوحدة قبل كتلة التقديم لا داخلها: إعلان ملاصق لزر التقديم يورّث
         نقرات عرضية، وهي مخالفة صريحة لسياسة AdSense -->
    <AdSlot v-if="j.descriptionHtml" :slot-id="AD_SLOTS.inArticle" min-height="280px" />

    <div v-if="j.applyUrl || j.applyEmail" class="mt-10 border-t border-border pt-8">
      <h2 class="font-headline text-xl font-extrabold">التقديم</h2>
      <div class="mt-4 flex flex-wrap gap-3">
        <a
          v-if="j.applyUrl"
          :href="j.applyUrl"
          target="_blank"
          rel="noopener nofollow"
          class="rounded-md bg-brand-red px-6 py-2.5 font-headline font-bold text-white transition-opacity hover:opacity-90 dark:bg-brand-red-dark dark:text-brand-navy"
        >
          التقديم على الوظيفة
        </a>
        <a
          v-if="j.applyEmail"
          :href="`mailto:${j.applyEmail}?subject=${encodeURIComponent(j.title)}`"
          class="rounded-md border-2 border-brand-red px-6 py-2.5 font-headline font-bold text-brand-red transition-colors hover:bg-brand-red hover:text-white dark:border-brand-red-dark dark:text-brand-red-dark dark:hover:bg-brand-red-dark dark:hover:text-brand-navy"
        >
          التقديم بالبريد
        </a>
      </div>
      <p class="mt-4 text-xs leading-relaxed text-muted-foreground">
        «عاجل الآن» ناشر للإعلان ولا يتلقّى الطلبات ولا يشارك في التوظيف.
        لا تدفع أي مبلغ مقابل التقديم، ولا ترسل بيانات بنكية أو مستندات هوية قبل التحقّق من الجهة.
      </p>
    </div>

    <AdSlot :slot-id="AD_SLOTS.end" min-height="280px" />
  </main>
</template>
