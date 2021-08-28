export type WanikaniObjectTypes =
  | WanikaniSingularResource
  | WanikaniCollectionResource;

export type WanikaniCollectionResource = 'collection' | 'report';

export type WanikaniSingularResource =
  | 'assignment'
  | 'kanji'
  | 'level_progression'
  | 'radical'
  | 'reset'
  | 'review_statistic'
  | 'review'
  | 'spaced_repetition_system'
  | 'study_material'
  | 'user'
  | 'vocabulary';

export type WanikaniSubjectType = 'kanji' | 'radical' | 'vocabulary';

export type WanikaniPaginatedResult<T> = T & {
  id: number;
  total_count: number;
  pages?: {
    per_page: number;
    next_url: string | null;
    previous_url: string | null;
  };
};

export interface WanikaniObject<T> {
  id?: number;
  object: WanikaniObjectTypes;
  url: string;
  data_updated_at: Date;
  data: T;
}

export type WanikaniAssignmentResponse = WanikaniPaginatedResult<
  WanikaniObject<WanikaniObject<WanikaniAssignment>[]>
> & {
  object: 'assignment';
};

export interface WanikaniAssignment {
  available_at: Date | null;
  burned_at: Date | null;
  created_at: Date;
  hidden: boolean;
  passed_at: Date | null;
  resurrected_at: Date | null;
  srs_stage: number;
  started_at: Date | null;
  subject_id: number;
  subject_type: WanikaniSubjectType;
  unlocked_at: Date | null;
}

export interface WanikaniAssignmentQueryArguments {
  available_after?: Date;
  available_before?: Date;
  burned?: boolean;
  hidden?: boolean;
  ids?: number[];
  in_review?: boolean;
  immediately_available_for_lessons?: boolean;
  immediately_available_for_review?: boolean;
  levels?: number[];
  srs_stages?: number[];
  started?: boolean;
  subject_types?: WanikaniSubjectType[];
  unlocked?: boolean;
  updated_after?: Date;
}

export interface WanikaniLevelProgression {
  abandoned_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  level: number;
  passed_at: Date | null;
  started_at: Date | null;
  unlocked_at: Date | null;
}

export type WanikaniLevelProgressionResponse = WanikaniPaginatedResult<
  WanikaniObject<WanikaniAssignment>
> & {
  object: 'assignment';
};

export interface WanikaniUser {
  current_vacation_started_at: Date | null;
  level: number;
  preferences: WanikaniUserPreference;
  profile_url: string;
  started_at: Date | null;
  subscription: WanikaniUserSubscription;
  username: string;
}

export interface WanikaniUserPreference {
  default_voice_actor_id: number;
  lessons_autoplay_audio: boolean;
  lessons_batch_size: number;
  lessons_presentation_order:
    | 'ascending_level_then_subject'
    | 'shuffled'
    | 'ascending_level_then_shuffled';
  reviews_autoplay_audio: boolean;
  reviews_display_srs_indicator: boolean;
}

export interface WanikaniUserSubscription {
  active: boolean;
  max_level_granted: 3 | 60;
  period_ends_at: null | Date;
  type: 'free' | 'recurring' | 'lifetime';
}

export type WanikaniUserResponse = WanikaniObject<WanikaniUser>;

export interface WanikaniSubjectsQueryArguments {
  ids?: number[];
  types?: WanikaniSubjectType[];
  slugs?: string[];
  levels?: number[];
  hidden?: boolean;
  updated_after?: Date;
}

export type WanikaniSubjectResponse = WanikaniObject<
  WanikaniObject<WanikaniSubject>[]
>;

export interface WanikaniSubject {
  auxiliary_meanings: WanikaniAuxiliaryMeanings[];
  characters: string;
  created_at: Date;
  document_url: string;
  hidden_at: null | Date;
  lesson_position: number;
  level: number;
  meaning_mnemonic: string;
  meanings: WanikaniMeaning[];
  slug: string;
  spaced_repetition_system_id: number;
}

export interface WanikaniMeaning {
  meaning: string;
  primary: boolean;
  accepted_answer: boolean;
}

export interface WanikaniAuxiliaryMeanings {
  meaning: string;
  type: 'whitelist' | 'blacklist';
}

export interface WanikaniRadicalSubject extends WanikaniSubject {
  amalgamation_subject_ids: number[];
  characters: string | null;
  character_images: WanikaniCharacterImage;
}

export interface WanikaniKanjiSubject extends WanikaniSubject {
  amalgamation_subject_ids: number[];
  component_subject_ids: number[];
  meaning_hint: string | null;
  reading_hint: string | null;
  reading_mnemonic: string;
  readings: WanikaniReading[];
  visually_similar_subject_ids: string[];
}
export interface WanikaniVocabSubject extends WanikaniSubject {
  component_subject_ids: number[];
  context_sentences: WanikaniContextSentence[];
  meaning_mnemonic: string;
  parts_of_speech: string[];
  pronounciation_audios: WanikaniPronounciationAudios[];
  readings: Exclude<'type', WanikaniReading>[];
  reading_mnemonic: string;
}

export interface WanikaniPronounciationAudios {
  url: string;
  content_type: 'audio/mpeg' | 'audio/ogg';
  metadata: {
    gender: string;
    source_id: number;
    pronounciation: string;
    voice_actor_id: number;
    voice_actor_name: string;
    voice_description: string;
  };
}

export interface WanikaniContextSentence {
  en: string;
  ja: string;
}

export interface WanikaniReading {
  reading: string;
  primary: boolean;
  accepted_answer: boolean;
  type: 'kunyomi' | 'onyomi' | 'nanori';
}
export type WanikaniCharacterImage = WanikaniPngImage | WanikaniSvgImage;

export interface WanikaniPngImage {
  url: string;
  content_type: 'image/png';
  metadata: {
    color: string;
    dimensions: string;
    style_name: string;
  };
}
export interface WanikaniSvgImage {
  url: string;
  content_type: 'image/svg+xml';
  metadata: {
    inline_styles: boolean;
  };
}
