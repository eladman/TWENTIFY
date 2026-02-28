import type { Domain } from '@/types/user';
import { exercises } from '@/data/exercises';

// ── Citation type ──────────────────────────────────────────────────────

export interface Citation {
  id: string;
  authors: string;
  year: number;
  title: string;
  journal: string;
  finding: string;
  confidence: 'high' | 'medium' | 'low';
  domain: Domain;
}

// ── Helpers ─────────────────────────────────────────────────────────────

const c = (cit: Citation): Citation => cit;

// ── GYM citations (9) ──────────────────────────────────────────────────

const citationArray: Citation[] = [
  c({
    id: 'iversen_2021',
    authors: 'Iversen VM, Norum M, Schoenfeld BJ, Fimland MS',
    year: 2021,
    title:
      'No time to lift? Designing time-efficient training programs for strength and hypertrophy: a narrative review',
    journal: 'Sports Medicine',
    finding:
      'Time-efficient training needs just 3 movement patterns: squat, push, pull — covering the majority of muscle mass.',
    confidence: 'high',
    domain: 'gym',
  }),

  c({
    id: 'gentil_2013',
    authors: 'Gentil P, Soares SRS, Pereira MC, Cunha RR, Martorelli SS, Martorelli AS, Bottaro M',
    year: 2013,
    title:
      'Effect of adding single-joint exercises to a multi-joint exercise resistance-training program on strength and hypertrophy in untrained subjects',
    journal: 'J Strength Cond Res',
    finding:
      'Adding isolation exercises to a compound program produced no additional arm hypertrophy after 10 weeks.',
    confidence: 'high',
    domain: 'gym',
  }),

  c({
    id: 'schoenfeld_2017_volume',
    authors: 'Schoenfeld BJ, Ogborn D, Krieger JW',
    year: 2017,
    title:
      'Dose-response relationship between weekly resistance training volume and increases in muscle mass: a systematic review and meta-analysis',
    journal: 'J Sports Sciences',
    finding:
      'Each additional weekly set increases hypertrophy, but returns diminish sharply after 10–12 sets per muscle group.',
    confidence: 'high',
    domain: 'gym',
  }),

  c({
    id: 'schoenfeld_2017_load',
    authors: 'Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW',
    year: 2017,
    title:
      'Strength and hypertrophy adaptations between low- vs. high-load resistance training: a systematic review and meta-analysis',
    journal: 'J Strength Cond Res',
    finding:
      'Muscle hypertrophy is similar across loading zones (6–30+ reps) when sets are taken close to failure.',
    confidence: 'high',
    domain: 'gym',
  }),

  c({
    id: 'currier_2023',
    authors: 'Currier BS, Mcleod JC, Banfield L, Beyene J, Welton NJ, D\'Souza AC, Keogh JAJ, Lin L, Phillips SM',
    year: 2023,
    title:
      'Resistance training prescription for muscle strength and hypertrophy in healthy adults: a systematic review and Bayesian network meta-analysis',
    journal: 'Br J Sports Med',
    finding:
      'Higher loads (>80% 1RM) maximize strength gains. The 6–12 rep range balances both strength and hypertrophy.',
    confidence: 'high',
    domain: 'gym',
  }),

  c({
    id: 'kraemer_2004',
    authors: 'Kraemer WJ, Ratamess NA',
    year: 2004,
    title: 'Fundamentals of resistance training: progression and exercise prescription',
    journal: 'Med Sci Sports Exerc',
    finding:
      'Progressive overload is the most evidence-backed driver of strength adaptation.',
    confidence: 'high',
    domain: 'gym',
  }),

  c({
    id: 'schoenfeld_2024_rest',
    authors: 'Schoenfeld BJ, Henselmans M, Grgic J',
    year: 2024,
    title:
      'Effects of rest interval duration on muscular adaptations: a Bayesian meta-analysis',
    journal: 'Front Sports Active Living',
    finding:
      'No additional hypertrophy benefit from resting longer than 60–90 seconds. 2–3 minutes is optimal for compounds.',
    confidence: 'medium',
    domain: 'gym',
  }),

  c({
    id: 'schoenfeld_2016_frequency',
    authors: 'Schoenfeld BJ, Ogborn D, Krieger JW',
    year: 2016,
    title:
      'Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis',
    journal: 'Sports Medicine',
    finding:
      'Training each muscle group twice per week is superior to once per week for hypertrophy.',
    confidence: 'high',
    domain: 'gym',
  }),

  c({
    id: 'coleman_2024',
    authors: 'Coleman M, Harrison K, Grgic J, Schoenfeld BJ',
    year: 2024,
    title:
      'Effects of scheduled deload weeks on muscular adaptations in resistance-trained individuals',
    journal: 'PeerJ',
    finding:
      'Scheduled deload weeks may not be necessary for moderate-volume programs in the first 6+ months.',
    confidence: 'medium',
    domain: 'gym',
  }),

  // ── RUNNING citations (6) ────────────────────────────────────────────

  c({
    id: 'seiler_2010',
    authors: 'Seiler S',
    year: 2010,
    title: 'What is best practice for training intensity and duration distribution in endurance athletes?',
    journal: 'Sportscience',
    finding:
      'Elite endurance athletes train ~80% at low intensity and ~20% at high intensity — the polarized model.',
    confidence: 'high',
    domain: 'running',
  }),

  c({
    id: 'stoggl_2014',
    authors: 'Stöggl T, Sperlich B',
    year: 2014,
    title:
      'Polarized training has greater impact on key endurance variables than threshold, high intensity, or high volume training',
    journal: 'Front Physiol',
    finding:
      'Polarized training produced the greatest improvements in VO2peak (+11.7%) compared to threshold, HIIT, and high-volume training.',
    confidence: 'high',
    domain: 'running',
  }),

  c({
    id: 'lee_2014',
    authors: 'Lee DC, Pate RR, Lavie CJ, Sui X, Church TS, Blair SN',
    year: 2014,
    title:
      'Leisure-time running reduces all-cause and cardiovascular mortality risk',
    journal: 'J Am Coll Cardiol',
    finding:
      'Even 5–10 minutes of slow running per day reduces all-cause mortality by 30% and cardiovascular mortality by 45%.',
    confidence: 'high',
    domain: 'running',
  }),

  c({
    id: 'pedisic_2020',
    authors: 'Pedisic Z, Shrestha N, Kovalchik S, Stamatakis E, Liangruenrom N, Grgic J, Titze S, Biddle SJH, Bauman AE, Oja P',
    year: 2020,
    title:
      'Is running associated with a lower risk of all-cause, cardiovascular and cancer mortality, and is the more the better? A systematic review and meta-analysis',
    journal: 'Br J Sports Med',
    finding:
      'Any amount of running — even once per week — is associated with 27% lower mortality. No dose-response trend found.',
    confidence: 'high',
    domain: 'running',
  }),

  c({
    id: 'wilson_2012',
    authors: 'Wilson JM, Marin PJ, Rhea MR, Wilson SMC, Loenneke JP, Anderson JC',
    year: 2012,
    title:
      'Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises',
    journal: 'J Strength Cond Res',
    finding:
      'Running as the endurance modality causes more interference with strength gains than cycling.',
    confidence: 'high',
    domain: 'running',
  }),

  c({
    id: 'lauersen_2018',
    authors: 'Lauersen JB, Andersen TE, Andersen LB',
    year: 2018,
    title:
      'Strength training as superior, dose-dependent and safe prevention of acute and overuse sports injuries: a systematic review, qualitative analysis and meta-analysis',
    journal: 'Br J Sports Med',
    finding:
      'Strength training reduces sports injuries by an average of 66%.',
    confidence: 'high',
    domain: 'running',
  }),

  // ── NUTRITION citations (6) ──────────────────────────────────────────

  c({
    id: 'helms_pyramid',
    authors: 'Helms ER, Aragon AA, Fitschen PJ',
    year: 2014,
    title:
      'Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation',
    journal: 'J Int Soc Sports Nutr',
    finding:
      'Calories and protein account for ~85% of body composition outcomes. Timing and supplements account for ~5%.',
    confidence: 'high',
    domain: 'nutrition',
  }),

  c({
    id: 'morton_2018',
    authors: 'Morton RW, Murphy KT, McKellar SR, Schoenfeld BJ, Henselmans M, Helms E, Aragon AA, Devries MC, Banfield L, Krieger JW, Phillips SM',
    year: 2018,
    title:
      'A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults',
    journal: 'Br J Sports Med',
    finding:
      'Protein supplementation beyond 1.62 g/kg/day produced no further muscle gains in a meta-analysis of 49 RCTs.',
    confidence: 'high',
    domain: 'nutrition',
  }),

  c({
    id: 'longland_2016',
    authors: 'Longland TM, Oikawa SY, Mitchell CJ, Devries MC, Phillips SM',
    year: 2016,
    title:
      'Higher compared with lower dietary protein during an energy deficit combined with intense exercise promotes greater lean mass gain and fat mass loss',
    journal: 'Am J Clin Nutr',
    finding:
      'At 2.4 g/kg/day protein with resistance training, subjects gained muscle while losing fat even in a 40% calorie deficit.',
    confidence: 'high',
    domain: 'nutrition',
  }),

  c({
    id: 'schoenfeld_2013_timing',
    authors: 'Schoenfeld BJ, Aragon AA, Krieger JW',
    year: 2013,
    title:
      'The effect of protein timing on muscle strength and hypertrophy: a meta-analysis',
    journal: 'J Int Soc Sports Nutr',
    finding:
      'When total daily protein is controlled, timing of protein around workouts has no independent effect on muscle growth.',
    confidence: 'high',
    domain: 'nutrition',
  }),

  c({
    id: 'thom_2020',
    authors: 'Thom G',
    year: 2020,
    title:
      'Accuracy of predictive equations for resting metabolic rate in healthy adults',
    journal: 'J Nutr Sci',
    finding:
      'Mifflin-St Jeor predicted resting metabolic rate within 10% accuracy for 71–80% of participants — the most accurate equation.',
    confidence: 'high',
    domain: 'nutrition',
  }),

  c({
    id: 'kreider_2017',
    authors: 'Kreider RB, Kalman DS, Antonio J, Ziegenfuss TN, Wildman R, Collins R, Candow DG, Kleiner SM, Almada AL, Lopez HL',
    year: 2017,
    title:
      'International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine',
    journal: 'J Int Soc Sports Nutr',
    finding:
      'Creatine monohydrate is the most effective ergogenic nutritional supplement for increasing lean mass and strength.',
    confidence: 'high',
    domain: 'nutrition',
  }),
];

// ── Exports ────────────────────────────────────────────────────────────

export const citations: Record<string, Citation> = Object.fromEntries(
  citationArray.map((cit) => [cit.id, cit]),
);

export const citationList: Citation[] = citationArray;

export function getCitationsForExercise(exerciseId: string): Citation[] {
  const exercise = exercises[exerciseId];
  if (!exercise) return [];
  return exercise.citationIds
    .map((citId) => citations[citId])
    .filter((cit): cit is Citation => cit != null);
}

export function getCitationsByDomain(domain: Domain): Citation[] {
  return citationArray.filter((cit) => cit.domain === domain);
}
