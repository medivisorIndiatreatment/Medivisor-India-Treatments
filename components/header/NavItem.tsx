'use client';

import { useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight, Activity, Building2, MapPin, Search, X, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { generateSlug } from '@/lib/slug-utils';
import { DESIGN_TOKENS } from '@/components/design-tokens';
import { Trans } from '@/lib/i18n/Trans';
import { useTranslatedString, useTranslatedStrings, useLang } from '@/lib/i18n';
import { BREAKPOINTS } from './constants';
import type {
  NavItem as NavItemType,
  TreatmentItem,
  HospitalBranch,
  DoctorItem,
  TestDiagnosisItem,
} from './types';

interface NavItemProps {
  item: NavItemType;
  isOpen: boolean;
  onToggle: (label: string) => void;
  isMobile?: boolean;
  windowWidth: number;
  treatments: TreatmentItem[];
  hospitals: HospitalBranch[];
  doctors: DoctorItem[];
  testDiagnoses: TestDiagnosisItem[];
  treatmentSearch: string;
  setTreatmentSearch: (value: string) => void;
  hospitalSearch: string;
  setHospitalSearch: (value: string) => void;
  doctorSearch: string;
  setDoctorSearch: (value: string) => void;
  testDiagnosisSearch: string;
  setTestDiagnosisSearch: (value: string) => void;
  onCloseMobile?: () => void;
}

export default function NavItem({
  item,
  isOpen,
  onToggle,
  isMobile = false,
  windowWidth,
  treatments,
  hospitals,
  doctors,
  testDiagnoses,
  treatmentSearch,
  setTreatmentSearch,
  hospitalSearch,
  setHospitalSearch,
  doctorSearch,
  setDoctorSearch,
  testDiagnosisSearch,
  setTestDiagnosisSearch,
  onCloseMobile,
}: NavItemProps) {
  const isDesktop = windowWidth >= BREAKPOINTS.MOBILE;
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isDynamic = item.isDynamic;
  const isTreatments = item.dataType === 'treatments';
  const isDoctors = item.dataType === 'doctors';
  const isHospitals = item.dataType === 'hospitals';
  const isTestDiagnoses = item.dataType === 'testDiagnoses';
  const data = isTreatments
    ? treatments
    : isDoctors
    ? doctors
    : isHospitals
    ? hospitals
    : testDiagnoses;
  const search = isTreatments
    ? treatmentSearch
    : isDoctors
    ? doctorSearch
    : isHospitals
    ? hospitalSearch
    : testDiagnosisSearch;
  const setSearch = isTreatments
    ? setTreatmentSearch
    : isDoctors
    ? setDoctorSearch
    : isHospitals
    ? setHospitalSearch
    : setTestDiagnosisSearch;
  const { dir } = useLang();

  const searchTreatmentPlaceholder = useTranslatedString('Search Treatments', false);
  const searchDoctorPlaceholder = useTranslatedString('Search Doctors', false);
  const searchHospitalPlaceholder = useTranslatedString('Search Hospitals', false);
  const searchTestDiagnosisPlaceholder = useTranslatedString('Search Tests', false);
  const loadingTreatments = useTranslatedString('Loading treatments...', false);
  const loadingDoctors = useTranslatedString('Loading doctors...', false);
  const loadingHospitals = useTranslatedString('Loading hospitals...', false);
  const loadingTestDiagnoses = useTranslatedString('Loading tests & diagnoses...', false);
  const noTreatmentsSearch = useTranslatedString('No treatments found', false);
  const noDoctorsSearch = useTranslatedString('No doctors found', false);
  const noHospitalsSearch = useTranslatedString('No hospitals found', false);
  const noTestDiagnosesSearch = useTranslatedString('No tests & diagnoses found', false);
  const loadingGeneric = useTranslatedString('Loading...', false);

  const treatmentNames = useMemo(() => treatments.map((t) => t.name || ''), [treatments]);
  const translatedTreatmentNames = useTranslatedStrings(treatmentNames, false);
  const treatmentNameMap = useMemo(() => {
    const map = new Map<string, string>();
    treatmentNames.forEach((name, i) => {
      map.set(name, translatedTreatmentNames[i] || name);
    });
    return map;
  }, [treatmentNames, translatedTreatmentNames]);

  const doctorNames = useMemo(() => doctors.map((d) => d.doctorName || ''), [doctors]);
  const translatedDoctorNames = useTranslatedStrings(doctorNames, false);
  const doctorNameMap = useMemo(() => {
    const map = new Map<string, string>();
    doctorNames.forEach((name, i) => {
      map.set(name, translatedDoctorNames[i] || name);
    });
    return map;
  }, [doctorNames, translatedDoctorNames]);

  const testDiagnosisNames = useMemo(() => testDiagnoses.map((td) => td.name || ''), [testDiagnoses]);
  const translatedTestDiagnosisNames = useTranslatedStrings(testDiagnosisNames, false);
  const testDiagnosisNameMap = useMemo(() => {
    const map = new Map<string, string>();
    testDiagnosisNames.forEach((name, i) => {
      map.set(name, translatedTestDiagnosisNames[i] || name);
    });
    return map;
  }, [testDiagnosisNames, translatedTestDiagnosisNames]);

  const hospitalBranchNames = useMemo(() => hospitals.map((h) => h.branchName || ''), [hospitals]);
  const translatedHospitalBranchNames = useTranslatedStrings(hospitalBranchNames, false);
  const hospitalBranchNameMap = useMemo(() => {
    const map = new Map<string, string>();
    hospitalBranchNames.forEach((name, i) => {
      map.set(name, translatedHospitalBranchNames[i] || name);
    });
    return map;
  }, [hospitalBranchNames, translatedHospitalBranchNames]);

  const hospitalNames = useMemo(() => hospitals.map((h) => h.hospitalName || ''), [hospitals]);
  const translatedHospitalNames = useTranslatedStrings(hospitalNames, false);
  const hospitalNameMap = useMemo(() => {
    const map = new Map<string, string>();
    hospitalNames.forEach((name, i) => {
      map.set(name, translatedHospitalNames[i] || name);
    });
    return map;
  }, [hospitalNames, translatedHospitalNames]);

  const handleMouseEnter = useCallback(() => {
    if (isDesktop && isDynamic) {
      if (item.dataType === 'treatments') {
        setTreatmentSearch('');
      } else if (item.dataType === 'hospitals') {
        setHospitalSearch('');
      } else if (item.dataType === 'doctors') {
        setDoctorSearch('');
      } else if (item.dataType === 'testDiagnoses') {
        setTestDiagnosisSearch('');
      }
    }
  }, [isDesktop, isDynamic, item.dataType, setTreatmentSearch, setHospitalSearch, setDoctorSearch, setTestDiagnosisSearch]);

  const handleClick = useCallback(() => {
    if (hasSubItems || isDynamic) {
      onToggle(item.label);
    }
  }, [hasSubItems, isDynamic, item.label, onToggle]);

const getTranslatedName = (dataType: string, name: string): string => {
    if (dataType === 'treatments') return treatmentNameMap.get(name) || name;
    if (dataType === 'doctors') return doctorNameMap.get(name) || name;
    if (dataType === 'testDiagnoses') return testDiagnosisNameMap.get(name) || name;
    return hospitalBranchNameMap.get(name) || name;
  };

  const getTranslatedHospitalName = (name: string): string => {
    return hospitalNameMap.get(name) || name;
  };

  const placeholder = isTreatments
    ? searchTreatmentPlaceholder
    : isDoctors
    ? searchDoctorPlaceholder
    : isHospitals
    ? searchHospitalPlaceholder
    : searchTestDiagnosisPlaceholder;
  const placeholderKey = isTreatments
    ? 'nav.search.treatments'
    : isDoctors
    ? 'nav.search.doctors'
    : isHospitals
    ? 'nav.search.hospitals'
    : 'nav.search.test-diagnoses';

  const renderLabel = () => {
    const i18nKey = item.i18nKey || '';
    if (item.href && !hasSubItems) {
      return (
        <Link
          href={item.href}
          className={`py-2 px-3 rounded hover:text-[${DESIGN_TOKENS.COLORS.SECONDARY}] ${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE}`}
          onClick={onCloseMobile}
data-i18n={i18nKey}
          data-i18n-original={item.label}
        >
          <Trans id={i18nKey}>{item.label}</Trans>
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
className={`flex items-center justify-between py-1 px-3 cursor-default select-none ${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} hover:text-[${DESIGN_TOKENS.COLORS.SECONDARY}] bg-transparent border-none w-full text-start`}
        aria-expanded={isOpen}
      >
        <span data-i18n={i18nKey} data-i18n-original={item.label}>
          <Trans id={i18nKey}>{item.label}</Trans>
        </span>
        {(hasSubItems || isDynamic) && (
          <ChevronDown
            size={14}
            className={`ms-1 text-gray-500 cursor-pointer chevron-down ${isOpen ? 'rotate-180' : ''} ${isDesktop && !isMobile ? 'group-hover:rotate-180' : ''}`}
            aria-hidden="true"
          />
        )}
      </button>
    );
  };

  const renderDynamicContent = () => {
    if (!isDynamic) return null;

  const emptyMessage = search
      ? (isTreatments
          ? `${noTreatmentsSearch} "${search}"`
          : (isDoctors
              ? `${noDoctorsSearch} "${search}"`
              : (isHospitals
                  ? `${noHospitalsSearch} "${search}"`
                  : `${noTestDiagnosesSearch} "${search}"`)))
      : (isTreatments
          ? loadingTreatments
          : (isDoctors
              ? loadingDoctors
              : (isHospitals ? loadingHospitals : loadingTestDiagnoses)));
    const emptyMessageKey = search
      ? (isTreatments
          ? 'nav.no-treatments-search'
          : (isDoctors
              ? 'nav.no-doctors-search'
              : (isHospitals
                  ? 'nav.no-hospitals-search'
                  : 'nav.no-test-diagnoses-search')))
      : (isTreatments
          ? 'nav.loading-treatments'
          : (isDoctors
              ? 'nav.loading-doctors'
              : (isHospitals ? 'nav.loading-hospitals' : 'nav.loading-test-diagnoses')));

    const renderList = () => {
      if (data.length === 0) {
        return (
<div className={`px-4 py-6 ${DESIGN_TOKENS.TYPOGRAPHY.BODY_XS} text-gray-400 text-center`} data-i18n-original={emptyMessage} data-trans-managed="true">
            <Trans id={emptyMessageKey}>{emptyMessage}</Trans>
          </div>
        );
      }

      const sortedData = [...data].sort((a, b) => {
        const nameA = isTreatments
          ? (a as TreatmentItem).name
          : isDoctors
          ? (a as DoctorItem).doctorName
          : isHospitals
          ? (a as HospitalBranch).branchName
          : (a as TestDiagnosisItem).name;
        const nameB = isTreatments
          ? (b as TreatmentItem).name
          : isDoctors
          ? (b as DoctorItem).doctorName
          : isHospitals
          ? (b as HospitalBranch).branchName
          : (b as TestDiagnosisItem).name;
        return String(nameA || '').localeCompare(String(nameB || ''));
      });

      return (
        <>
          {sortedData.map((itemData: any) => {
    const originalName = isTestDiagnoses
        ? (itemData as TestDiagnosisItem).name
        : itemData.name || (itemData as DoctorItem).doctorName || (itemData as HospitalBranch).branchName;
            const translatedName = getTranslatedName(item.dataType || '', originalName);
            const href = isTreatments
              ? `/treatment/${generateSlug(originalName)}`
              : (isDoctors
                  ? `/doctors/${(itemData as DoctorItem).href}`
                  : (isHospitals
                      ? (itemData as HospitalBranch).href
                      : `/test-diagnosis/${(itemData as TestDiagnosisItem).slug}`));
            const Icon = isTreatments ? Activity : (isDoctors ? Stethoscope : (isHospitals ? Building2 : Activity));

            return (
              <div key={itemData._id || (isDoctors ? (itemData as DoctorItem).href : (isHospitals ? (itemData as HospitalBranch).href : (itemData as TestDiagnosisItem).slug))} className="border-b border-gray-100 bg-white last:border-b-0">
                <Link
                  href={href}
                  className={`flex group items-start gap-2.5 py-2 px-4 w-full ${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} text-[#241d1f] hover:bg-cyan-100 hover:text-[${DESIGN_TOKENS.COLORS.SECONDARY}]`}
                  onClick={onCloseMobile}
                >
                  <Icon size={15} className="text-[#23366E] group-hover:text-[#29a5c8] mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
<div className="font-medium truncate" data-i18n-original={originalName} data-trans-managed="true">
                      {translatedName}
                    </div>
                    {!isTreatments && !isDoctors && !isTestDiagnoses && (itemData as HospitalBranch).city && (
                      <div className={`flex items-center gap-1 ${DESIGN_TOKENS.TYPOGRAPHY.CAPTION} mt-0.5`}>
                        <MapPin size={10} />
<span className="truncate" data-i18n-original={(itemData as HospitalBranch).city} data-trans-managed="true">{(itemData as HospitalBranch).city}</span>
                      </div>
                    )}
                    {isDoctors && (itemData as DoctorItem).specialization && (
                      <div className="text-xs text-gray-500 mt-0.5 truncate" data-i18n-original={(itemData as DoctorItem).specialization} data-trans-managed="true">{(itemData as DoctorItem).specialization}</div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
          {sortedData.length > 10 && (
            <div className="sticky bottom-0 flex justify-center py-1.5 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
<ChevronDown size={14} className="text-gray-400 chevron-down" aria-hidden="true" />
            </div>
          )}
        </>
      );
    };

    if (isDesktop && !isMobile) {
      return (
        <div className="max-h-[380px] md:max-h-[420px] w-[280px] xl:w-[320px] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white px-3 py-2 border-b border-gray-100">
            <div className="relative">
<Search className="w-4 h-4 text-gray-400 absolute inset-y-0 my-auto left-3 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                dir="ltr"
                className={`w-full pl-9 pr-3 py-2 text-sm text-black border border-gray-200 rounded-md focus:outline-none focus:ring-1 bg-gray-50 placeholder:text-black text-left`}
                data-i18n-original={isTreatments ? 'Search Treatments' : (isDoctors ? 'Search Doctors' : (isHospitals ? 'Search Hospitals' : 'Search Tests'))}
                data-i18n={placeholderKey}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                className="absolute inset-y-0 my-auto right-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          {renderList()}
        </div>
      );
    }

    if (isMobile && isOpen) {
      return (
        <div>
          <div className="px-3 py-2 bg-gray-50 rounded-md mx-2 mb-2">
            <div className="relative mb-2">
<Search className="w-4 h-4 text-gray-400 absolute inset-y-0 my-auto left-3 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                dir="ltr"
                className={`w-full pl-9 pr-3 py-2 text-sm text-black border border-gray-200 rounded-md focus:outline-none focus:ring-1 bg-white placeholder:text-black text-left`}
                data-i18n-original={isTreatments ? 'Search Treatments' : (isDoctors ? 'Search Doctors' : (isHospitals ? 'Search Hospitals' : 'Search Tests'))}
                data-i18n={placeholderKey}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                className="absolute inset-y-0 my-auto right-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {data.length > 0 ? (
                [...data].sort((a, b) => {
                  const nameA = isTreatments
                    ? (a as TreatmentItem).name
                    : isDoctors
                    ? (a as DoctorItem).doctorName
                    : isHospitals
                    ? (a as HospitalBranch).branchName
                    : (a as TestDiagnosisItem).name;
                  const nameB = isTreatments
                    ? (b as TreatmentItem).name
                    : isDoctors
                    ? (b as DoctorItem).doctorName
                    : isHospitals
                    ? (b as HospitalBranch).branchName
                    : (b as TestDiagnosisItem).name;
                  return String(nameA || '').localeCompare(String(nameB || ''));
                }).map((itemData: any) => {
const originalName = isTestDiagnoses
                    ? (itemData as TestDiagnosisItem).name
                    : itemData.name || (itemData as DoctorItem).doctorName || (itemData as HospitalBranch).branchName;
                  const translatedName = getTranslatedName(item.dataType || '', originalName);
                  const href = isTreatments
                    ? `/treatment/${generateSlug(originalName)}`
                    : (isDoctors
                        ? `/doctors/${(itemData as DoctorItem).href}`
                        : (isHospitals
                            ? (itemData as HospitalBranch).href
                            : `/test-diagnosis/${(itemData as TestDiagnosisItem).slug}`));
                  const Icon = isTreatments ? Activity : (isDoctors ? Stethoscope : (isHospitals ? Building2 : Activity));

                  return (
                    <Link
                      key={itemData._id || (isDoctors ? (itemData as DoctorItem).href : (isHospitals ? (itemData as HospitalBranch).href : (itemData as TestDiagnosisItem).slug))}
                      href={href}
                      className="flex items-start gap-2 px-3 py-2 text-sm text-[#241d1f] hover:bg-red-50 hover:text-[#23366E] rounded-md"
                      onClick={onCloseMobile}
                    >
<Icon size={14} className="text-[#23366E] mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="font-medium truncate" data-i18n-original={originalName} data-trans-managed="true">
                          {translatedName}
                        </div>
                        {!isTreatments && !isDoctors && !isTestDiagnoses && (itemData as HospitalBranch).city && (
                          <div className="text-xs text-gray-400 mt-0.5" data-i18n-original={(itemData as HospitalBranch).city} data-trans-managed="true">{(itemData as HospitalBranch).city}</div>
                        )}
                        {isDoctors && (itemData as DoctorItem).specialization && (
                          <div className="text-xs text-gray-500 mt-0.5" data-i18n-original={(itemData as DoctorItem).specialization} data-trans-managed="true">{(itemData as DoctorItem).specialization}</div>
                        )}
                      </div>
                    </Link>
                  );
                })
              ) : (
<p className={`text-sm text-gray-400 text-center py-3`} data-i18n-original={search ? emptyMessage : 'Loading...'} data-trans-managed="true">
                  <Trans id={search ? emptyMessageKey : 'nav.loading'}>{search ? emptyMessage : loadingGeneric}</Trans>
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderStaticSubitems = () => {
    if (!item.subItems) return null;

    if (isMobile && isOpen) {
      return (
<div className="mt-1 ms-2 border-s-2 border-[#23366E] ps-3">
          <ul className="space-y-1">
            {item.subItems.map((subItem) => {
              const i18nKey = subItem.i18nKey || subItem.label;
              return (
                <li key={subItem.label}>
                  {subItem.hasNested ? (
                    <span className={`flex items-center justify-between ${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} text-gray-700 py-2`} data-i18n={i18nKey} data-i18n-original={subItem.label} data-trans-managed="true">
                      <Trans id={i18nKey}>{subItem.label}</Trans>
                      <ChevronRight size={14} className="text-gray-400 chevron-right" />
                    </span>
                  ) : (
                    <Link
                      href={subItem.href!}
                      className={`block py-2 ${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} text-[#241d1f] hover:bg-[${DESIGN_TOKENS.COLORS.SECONDARY}]/10 hover:text-[${DESIGN_TOKENS.COLORS.SECONDARY}]`}
                      onClick={onCloseMobile}
                      data-i18n={i18nKey}
                      data-i18n-original={subItem.label}
                    >
                      <Trans id={i18nKey}>{subItem.label}</Trans>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    if (isDesktop && !isMobile && !isDynamic) {
      return (
        <>
{item.subItems.map((subItem) => {
            const i18nKey = subItem.i18nKey || subItem.label;
            return (
              <li key={subItem.label}>
                {subItem.hasNested ? (
                  <span className={`flex items-center justify-between px-4 py-2 ${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} hover:text-[${DESIGN_TOKENS.COLORS.SECONDARY}] text-[#241d1f] hover:bg-[${DESIGN_TOKENS.COLORS.SECONDARY}]/10 cursor-default`} data-i18n={i18nKey} data-i18n-original={subItem.label} data-trans-managed="true">
                    <Trans id={i18nKey}>{subItem.label}</Trans>
                    <ChevronRight size={14} className="text-gray-400 chevron-right" />
                  </span>
                ) : (
                  <Link
                    href={subItem.href!}
                    className={`block px-4 py-2 ${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} text-[#241d1f] hover:bg-[${DESIGN_TOKENS.COLORS.SECONDARY}]/10 hover:text-[${DESIGN_TOKENS.COLORS.SECONDARY}]`}
                    data-i18n={i18nKey}
                    data-i18n-original={subItem.label}
                  >
                    <Trans id={i18nKey}>{subItem.label}</Trans>
                  </Link>
                )}
              </li>
            );
          })}
        </>
      );
    }

    return null;
  };

  return (
    <li
      className={`relative group font-medium text-[#241d1f]`}
      onMouseEnter={() => {
        if (isDesktop) {
          handleMouseEnter();
        }
      }}
    >
      {renderLabel()}

      {(hasSubItems || isDynamic) && (
        <ul
          className={`
            ${isDesktop && !isMobile
  ? `absolute top-full start-0 md:end-0 md:start-auto bg-white max-h-[380px] md:max-h-[420px] w-[280px] xl:w-[320px] shadow-lg rounded-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50`
              : `overflow-hidden bg-gray-50 ${isOpen ? 'max-h-screen' : 'max-h-0'}`
            }
          `}
          dir="auto"
        >
          {isDynamic ? renderDynamicContent() : renderStaticSubitems()}
        </ul>
      )}
    </li>
  );
}
