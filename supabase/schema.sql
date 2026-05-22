CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


CREATE TYPE gender_type AS ENUM('male', 'female', 'other');
CREATE TYPE relationship_type AS ENUM('self', 'child', 'wife', 'husband', 'parent', 'sibling', 'other');
CREATE TYPE stunting_status_type AS ENUM('normal', 'stunted', 'severely_stunted');
CREATE TYPE wasting_status_type AS ENUM('normal', 'wasted', 'severely_wasted', 'overweight', 'obese');
CREATE TYPE food_source_type AS ENUM('manual', 'usda', 'fatsecret', 'nutritionix');
CREATE TYPE meal_type AS ENUM('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE profile_type AS ENUM('user', 'admin');
CREATE TYPE life_stage_type AS ENUM('balita', 'anak', 'remaja', 'dewasa');
CREATE TYPE audit_target_type AS ENUM('profile', 'subject', 'food', 'article');
CREATE TYPE action_type AS ENUM('create', 'update', 'delete');
CREATE TYPE category_type AS ENUM('staple', 'protein_animal', 'protein_plant', 'vegetable', 'fruit', 'dairy', 'snack', 'beverage', 'other');


CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    avatar_url text,
    role profile_type NOT NULL DEFAULT 'user',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);


CREATE TABLE public.subjects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    gender gender_type NOT NULL,
    birth_date date NOT NULL,
    relationship relationship_type NOT NULL DEFAULT 'self',
    height_cm decimal(5,2),
    activity_level decimal(3,2) DEFAULT 1.20,
    is_primary boolean NOT NULL DEFAULT false,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT check_subject_birth_past CHECK (birth_date <= CURRENT_DATE),
    CONSTRAINT check_subject_height CHECK (height_cm IS NULL OR (height_cm > 0 AND height_cm < 300)),
    CONSTRAINT check_subject_activity CHECK (activity_level IS NULL OR activity_level BETWEEN 1.0 AND 2.5),
    CONSTRAINT check_self_relationship CHECK (
        (is_primary = false) OR (is_primary = true AND relationship = 'self')
    )
);

CREATE UNIQUE INDEX unique_one_primary_subject_per_profile
    ON public.subjects(profile_id) WHERE is_primary = true;


CREATE TABLE public.growth_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    weight_kg decimal(5,2) NOT NULL,
    height_cm decimal(5,2) NOT NULL,

    height_for_age decimal(4,2),
    weight_for_age decimal(4,2),
    weight_for_height decimal(4,2),

    stunting_status stunting_status_type,
    wasting_status wasting_status_type,

    bmi decimal(4,2) GENERATED ALWAYS AS (
        CASE WHEN height_cm > 0
        THEN weight_kg / ((height_cm / 100) * (height_cm / 100))
        END
    ) STORED,

    description text,
    recorded_at date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT check_growth_log_weight CHECK (weight_kg > 0 AND weight_kg < 500),
    CONSTRAINT check_growth_log_height CHECK (height_cm > 0 AND height_cm < 300)
);


CREATE TABLE public.food (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    name_lower_case text GENERATED ALWAYS AS (lower(name)) STORED,
    brand text,
    category category_type NOT NULL DEFAULT 'other',
    description text,
    image_url text,

    calories_per_100g decimal(7,2) NOT NULL,
    protein_per_100g decimal(6,2) NOT NULL DEFAULT 0,
    carbs_per_100g decimal(6,2) NOT NULL DEFAULT 0,
    fat_per_100g decimal(6,2) NOT NULL DEFAULT 0,
    fiber_per_100g decimal(6,2) DEFAULT 0,

    source food_source_type NOT NULL DEFAULT 'manual',
    external_id text,

    is_verified boolean NOT NULL DEFAULT false,
    verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at timestamptz,

    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),

    deleted_at timestamptz,

    CONSTRAINT unique_food_external_id UNIQUE (external_id, source),
    CONSTRAINT check_food_calories CHECK (calories_per_100g >= 0),
    CONSTRAINT check_food_protein CHECK (protein_per_100g >= 0),
    CONSTRAINT check_food_carbs CHECK (carbs_per_100g >= 0),
    CONSTRAINT check_food_fat CHECK (fat_per_100g >= 0),
    CONSTRAINT check_food_fiber CHECK (fiber_per_100g IS NULL OR fiber_per_100g >= 0),
    CONSTRAINT check_food_verified CHECK (
        (is_verified = true AND verified_by IS NOT NULL AND verified_at IS NOT NULL)
        OR (is_verified = false AND verified_by IS NULL AND verified_at IS NULL)
    )
);


CREATE TABLE public.nutrition_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    food_id uuid REFERENCES public.food(id) ON DELETE SET NULL,
    food_name text NOT NULL,
    serving_quantity decimal(6,2) NOT NULL DEFAULT 1,
    serving_unit text NOT NULL DEFAULT 'porsi',
    calories decimal(7,2) NOT NULL,
    protein decimal(6,2) NOT NULL DEFAULT 0,
    carbs decimal(6,2) NOT NULL DEFAULT 0,
    fat decimal(6,2) NOT NULL DEFAULT 0,
    meal meal_type NOT NULL,
    logged_at timestamptz NOT NULL DEFAULT NOW(),
    log_date date NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT check_nutrition_log_calories CHECK (calories >= 0),
    CONSTRAINT check_nutrition_log_protein CHECK (protein >= 0),
    CONSTRAINT check_nutrition_log_carbs CHECK (carbs >= 0),
    CONSTRAINT check_nutrition_log_fat CHECK (fat >= 0),
    CONSTRAINT check_serving_quantity CHECK (serving_quantity > 0)
);


CREATE TABLE public.nutrition_target (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    daily_calories decimal(7,2) NOT NULL,
    daily_protein decimal(6,2) NOT NULL DEFAULT 0,
    daily_carbs decimal(6,2) NOT NULL DEFAULT 0,
    daily_fat decimal(6,2) NOT NULL DEFAULT 0,

    basal_metabolic_rate decimal(7,2),
    total_daily_energy_expenditure decimal(7,2),
    calculation_method text,
    effective_from date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT check_nutrition_target_calories CHECK (daily_calories >= 0),
    CONSTRAINT check_nutrition_target_protein CHECK (daily_protein >= 0),
    CONSTRAINT check_nutrition_target_carbs CHECK (daily_carbs >= 0),
    CONSTRAINT check_nutrition_target_fat CHECK (daily_fat >= 0)
);


CREATE TABLE public.articles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    excerpt text,
    content text NOT NULL,
    cover_image_url text,
    target_life_stage life_stage_type,
    author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published boolean NOT NULL DEFAULT false,
    published_at timestamptz,
    view_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT check_article_published CHECK (
        (is_published = false)
        OR (is_published = true AND published_at IS NOT NULL AND author_id IS NOT NULL)
    ),
    CONSTRAINT check_view_count CHECK (view_count >= 0)
);


CREATE TABLE public.audit_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_email text,
    actor_role profile_type,
    action action_type NOT NULL,
    target_type audit_target_type NOT NULL,
    target_id uuid,
    old_data jsonb,
    new_data jsonb,
    description text,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT NOW()
);


CREATE INDEX index_subjects_profile ON public.subjects(profile_id);
CREATE INDEX index_subject_birth_date ON public.subjects(birth_date);
CREATE INDEX index_growth_subject_date ON public.growth_log(subject_id, recorded_at DESC);
CREATE INDEX index_food_name_trgm ON public.food USING gin (name_lower_case gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX index_food_category ON public.food(category) WHERE deleted_at IS NULL;
CREATE INDEX index_food_verified ON public.food(is_verified) WHERE deleted_at IS NULL;
CREATE INDEX index_nutrition_subject_date ON public.nutrition_log(subject_id, log_date DESC);
CREATE INDEX index_nutrition_food ON public.nutrition_log(food_id);
CREATE INDEX index_target_subject_effective ON public.nutrition_target(subject_id, effective_from DESC);
CREATE INDEX index_articles_published ON public.articles(is_published, published_at DESC);
CREATE INDEX index_articles_life_stage ON public.articles(target_life_stage) WHERE is_published = true;
CREATE INDEX index_articles_slug ON public.articles(slug);
CREATE INDEX index_audit_actor_date ON public.audit_log(actor_id, created_at DESC);
CREATE INDEX index_audit_action_date ON public.audit_log(action, created_at DESC);
CREATE INDEX index_audit_target ON public.audit_log(target_type, target_id);
CREATE INDEX index_audit_created_at ON public.audit_log(created_at DESC);


CREATE OR REPLACE FUNCTION public.life_stage_of(p_birth_date date)
RETURNS life_stage_type LANGUAGE sql STABLE AS $$
    SELECT CASE
        WHEN p_birth_date > CURRENT_DATE - INTERVAL '5 years'  THEN 'balita'::life_stage_type
        WHEN p_birth_date > CURRENT_DATE - INTERVAL '13 years' THEN 'anak'::life_stage_type
        WHEN p_birth_date > CURRENT_DATE - INTERVAL '19 years' THEN 'remaja'::life_stage_type
        ELSE 'dewasa'::life_stage_type
    END;
$$;


CREATE OR REPLACE FUNCTION public.age_years(p_birth_date date)
RETURNS integer LANGUAGE sql STABLE AS $$
    SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_birth_date))::integer;
$$;


CREATE OR REPLACE FUNCTION public.age_months(p_birth_date date)
RETURNS integer LANGUAGE sql STABLE AS $$
    SELECT (EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_birth_date)) * 12
          + EXTRACT(MONTH FROM AGE(CURRENT_DATE, p_birth_date)))::integer;
$$;


CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
$$;


CREATE OR REPLACE FUNCTION public.owns_subject(p_subject_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.subjects
        WHERE id = p_subject_id AND profile_id = auth.uid()
    );
$$;


CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION public.log_audit_action()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_target_type audit_target_type;
    v_action action_type;
    v_target_id uuid;
    v_old jsonb;
    v_new jsonb;
    v_actor_email text;
    v_actor_role profile_type;
BEGIN
    v_target_type := TG_ARGV[0]::audit_target_type;

    IF TG_OP = 'INSERT' THEN
        v_action := 'create';
        v_old := NULL;
        v_new := to_jsonb(NEW);
        v_target_id := NEW.id;
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'update';
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
        v_target_id := NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'delete';
        v_old := to_jsonb(OLD);
        v_new := NULL;
        v_target_id := OLD.id;
    ELSE
        RETURN NULL;
    END IF;

    SELECT u.email, p.role
      INTO v_actor_email, v_actor_role
      FROM auth.users u
      LEFT JOIN public.profiles p ON p.id = u.id
     WHERE u.id = auth.uid();

    INSERT INTO public.audit_log (
        actor_id, actor_email, actor_role,
        action, target_type, target_id,
        old_data, new_data
    ) VALUES (
        auth.uid(), v_actor_email, v_actor_role,
        v_action, v_target_type, v_target_id,
        v_old, v_new
    );

    RETURN COALESCE(NEW, OLD);
END;
$$;


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'user'
    );
    RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION public.set_food_verified_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.is_verified = true AND (OLD.is_verified IS NULL OR OLD.is_verified = false) THEN
        NEW.verified_at := NOW();
        NEW.verified_by := auth.uid();
    ELSIF NEW.is_verified = false THEN
        NEW.verified_at := NULL;
        NEW.verified_by := NULL;
    END IF;
    RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION public.set_article_published_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.is_published = true AND (TG_OP = 'INSERT' OR OLD.is_published = false OR OLD.is_published IS NULL) THEN
        NEW.published_at := NOW();
    ELSIF NEW.is_published = false THEN
        NEW.published_at := NULL;
    END IF;
    RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION public.set_nutrition_log_date()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.log_date := (NEW.logged_at AT TIME ZONE 'Asia/Jakarta')::date;
    RETURN NEW;
END;
$$;


CREATE TRIGGER trigger_audit_food
    AFTER INSERT OR UPDATE OR DELETE ON public.food
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_action('food');

CREATE TRIGGER trigger_audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_action('profile');

CREATE TRIGGER trigger_audit_subjects
    AFTER INSERT OR UPDATE OR DELETE ON public.subjects
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_action('subject');

CREATE TRIGGER trigger_audit_articles
    AFTER INSERT OR UPDATE OR DELETE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_action('article');

CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_food_updated_at
    BEFORE UPDATE ON public.food
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trigger_food_verified_timestamp
    BEFORE UPDATE ON public.food
    FOR EACH ROW EXECUTE FUNCTION public.set_food_verified_timestamp();

CREATE TRIGGER trigger_article_published_timestamp
    BEFORE INSERT OR UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.set_article_published_timestamp();

CREATE TRIGGER trigger_set_nutrition_log_date
    BEFORE INSERT OR UPDATE ON public.nutrition_log
    FOR EACH ROW EXECUTE FUNCTION public.set_nutrition_log_date();


ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_target ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log        ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profile_select_own_or_admin" ON public.profiles
    FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profile_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profile_update_own_or_admin" ON public.profiles
    FOR UPDATE USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "profile_delete_admin_only" ON public.profiles
    FOR DELETE USING (public.is_admin());


CREATE POLICY "subject_select_own_or_admin" ON public.subjects
    FOR SELECT USING (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY "subject_insert_own" ON public.subjects
    FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "subject_update_own_or_admin" ON public.subjects
    FOR UPDATE USING (profile_id = auth.uid() OR public.is_admin())
    WITH CHECK (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY "subject_delete_own_or_admin" ON public.subjects
    FOR DELETE USING (profile_id = auth.uid() OR public.is_admin());


CREATE POLICY "growth_select_own_or_admin" ON public.growth_log
    FOR SELECT USING (public.owns_subject(subject_id) OR public.is_admin());

CREATE POLICY "growth_insert_own" ON public.growth_log
    FOR INSERT WITH CHECK (public.owns_subject(subject_id));

CREATE POLICY "growth_update_own" ON public.growth_log
    FOR UPDATE USING (public.owns_subject(subject_id));

CREATE POLICY "growth_delete_own" ON public.growth_log
    FOR DELETE USING (public.owns_subject(subject_id));


CREATE POLICY "food_select_active_or_admin" ON public.food
    FOR SELECT USING (
        (auth.role() = 'authenticated' AND deleted_at IS NULL)
        OR public.is_admin()
    );

CREATE POLICY "food_insert_admin_only" ON public.food
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "food_update_admin_only" ON public.food
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "food_delete_admin_only" ON public.food
    FOR DELETE USING (public.is_admin());


CREATE POLICY "nutrition_log_select_own_or_admin" ON public.nutrition_log
    FOR SELECT USING (public.owns_subject(subject_id) OR public.is_admin());

CREATE POLICY "nutrition_log_insert_own" ON public.nutrition_log
    FOR INSERT WITH CHECK (public.owns_subject(subject_id));

CREATE POLICY "nutrition_log_update_own" ON public.nutrition_log
    FOR UPDATE USING (public.owns_subject(subject_id));

CREATE POLICY "nutrition_log_delete_own" ON public.nutrition_log
    FOR DELETE USING (public.owns_subject(subject_id));


CREATE POLICY "target_select_own_or_admin" ON public.nutrition_target
    FOR SELECT USING (public.owns_subject(subject_id) OR public.is_admin());

CREATE POLICY "target_insert_own" ON public.nutrition_target
    FOR INSERT WITH CHECK (public.owns_subject(subject_id));

CREATE POLICY "target_update_own" ON public.nutrition_target
    FOR UPDATE USING (public.owns_subject(subject_id));

CREATE POLICY "target_delete_own" ON public.nutrition_target
    FOR DELETE USING (public.owns_subject(subject_id));


CREATE POLICY "article_select_published_or_admin" ON public.articles
    FOR SELECT USING (is_published = true OR public.is_admin());

CREATE POLICY "article_insert_admin_only" ON public.articles
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "article_update_admin_only" ON public.articles
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "article_delete_admin_only" ON public.articles
    FOR DELETE USING (public.is_admin());


CREATE POLICY "audit_select_admin_only" ON public.audit_log
    FOR SELECT USING (public.is_admin());


CREATE OR REPLACE VIEW public.subjects_enriched AS
SELECT
    s.*,
    public.life_stage_of(s.birth_date) AS life_stage,
    public.age_years(s.birth_date)     AS age_years,
    public.age_months(s.birth_date)    AS age_months
FROM public.subjects s;


CREATE OR REPLACE VIEW public.daily_nutrition_summary AS
SELECT
    subject_id,
    log_date,
    SUM(calories) AS total_calories,
    SUM(protein)  AS total_protein,
    SUM(carbs)    AS total_carbs,
    SUM(fat)      AS total_fat,
    COUNT(*)      AS meal_count
FROM public.nutrition_log
GROUP BY subject_id, log_date;


CREATE OR REPLACE VIEW public.latest_growth AS
SELECT DISTINCT ON (subject_id)
    subject_id,
    weight_kg, height_cm, bmi,
    height_for_age, weight_for_age, weight_for_height,
    stunting_status, wasting_status,
    recorded_at
FROM public.growth_log
ORDER BY subject_id, recorded_at DESC;


CREATE OR REPLACE VIEW public.active_targets AS
SELECT DISTINCT ON (subject_id)
    subject_id,
    daily_calories, daily_protein, daily_carbs, daily_fat,
    basal_metabolic_rate, total_daily_energy_expenditure,
    calculation_method, effective_from
FROM public.nutrition_target
WHERE effective_from <= CURRENT_DATE
ORDER BY subject_id, effective_from DESC;


CREATE OR REPLACE VIEW public.food_active AS
SELECT
    id, name, brand, category, description, image_url,
    calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g,
    source, is_verified, created_at
FROM public.food
WHERE deleted_at IS NULL;


CREATE OR REPLACE VIEW public.audit_log_detailed AS
SELECT
    a.id,
    a.created_at,
    a.action,
    a.target_type,
    a.target_id,
    a.actor_id,
    a.actor_email,
    a.actor_role,
    p.full_name AS actor_name,
    a.old_data,
    a.new_data,
    a.description,
    a.ip_address,
    a.user_agent
FROM public.audit_log a
LEFT JOIN public.profiles p ON p.id = a.actor_id;


CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'user' AND is_active = true)    AS active_users,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'user' AND is_active = false)   AS inactive_users,
    (SELECT COUNT(*) FROM public.subjects)                                              AS total_subjects,
    (SELECT COUNT(*) FROM public.food WHERE deleted_at IS NULL)                        AS total_foods,
    (SELECT COUNT(*) FROM public.food WHERE is_verified = true AND deleted_at IS NULL) AS verified_foods,
    (SELECT COUNT(*) FROM public.articles WHERE is_published = true)                   AS published_articles,
    (SELECT COUNT(*) FROM public.audit_log WHERE created_at >= CURRENT_DATE)           AS today_audit_count;


GRANT SELECT ON public.subjects_enriched       TO authenticated;
GRANT SELECT ON public.daily_nutrition_summary TO authenticated;
GRANT SELECT ON public.latest_growth           TO authenticated;
GRANT SELECT ON public.active_targets          TO authenticated;
GRANT SELECT ON public.food_active             TO authenticated;
GRANT SELECT ON public.audit_log_detailed      TO authenticated;
GRANT SELECT ON public.admin_dashboard_stats   TO authenticated;

GRANT EXECUTE ON FUNCTION public.life_stage_of(date)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.age_years(date)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.age_months(date)     TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin()           TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_subject(uuid)   TO authenticated;