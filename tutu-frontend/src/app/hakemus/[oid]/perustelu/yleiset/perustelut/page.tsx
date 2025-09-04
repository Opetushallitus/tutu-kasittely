'use client';

import { VirallinenTutkinnonMyontaja } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/VirallinenTutkinnonMyontaja';
import { VirallinenTutkinto } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/VirallinenTutkinto';
import { Lahde } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/Lahde';
import { SelvitysTutkinnonMyontajastaJaVirallisuudesta } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/SelvitysTutkinnonMyontajastaJaVirallisuudesta';
import { YlimmanTutkinnonAsema } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/YlimmanTutkinnonAsema';
import { SelvitysTutkinnonAsemasta } from '@/src/app/hakemus/[oid]/perustelu/yleiset/perustelut/components/SelvitysTutkinnonAsemasta';

export default function YleisetPage() {
  return (
    <>
      <VirallinenTutkinnonMyontaja />
      <VirallinenTutkinto />
      <Lahde />
      <SelvitysTutkinnonMyontajastaJaVirallisuudesta />
      <YlimmanTutkinnonAsema />
      <SelvitysTutkinnonAsemasta />

      {/* Tutkintokohtaiset tiedot */}

      {/* Jatko-opintokelpoisuus ja muut perustelut */}
    </>
  );
}
