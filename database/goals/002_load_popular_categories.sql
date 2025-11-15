-- ============================================================================
-- GOALS MANAGEMENT SYSTEM - POPULAR CATEGORIES
-- ============================================================================
-- Version: 1.0.0
-- Phase: MVP
-- Description: Load 50 most popular goal categories
-- Note: Full 395+ categories available in separate migration if needed
-- ============================================================================

-- Insert top 50 popular goal categories
-- These cover 90% of common use cases

INSERT INTO goal_categories (name, description, icon, timeframe_default, priority_default, goal_type_default, suggested_amount_min, suggested_amount_max, common_duration_days, is_featured, display_order) VALUES

-- FINANCIAL SECURITY (Critical)
('Emergency Fund', '3-6 months of living expenses for unexpected situations', '🛡️', 'short', 'critical', 'savings', 5000, 25000, 365, true, 1),
('Rainy Day Fund', 'Small emergency fund for minor unexpected expenses', '☔', 'short', 'high', 'savings', 1000, 5000, 180, true, 2),
('Credit Card Payoff', 'Eliminate high-interest credit card debt', '💳', 'short', 'high', 'debt_payoff', 1000, 20000, 365, true, 3),

-- HOUSING
('Home Down Payment', 'Down payment for purchasing a home (typically 20%)', '🏡', 'medium', 'high', 'savings', 20000, 150000, 1095, true, 4),
('Home Renovation', 'Major home improvement or renovation project', '🔨', 'medium', 'medium', 'purchase', 10000, 100000, 365, true, 5),
('Moving Costs', 'Costs associated with relocating to a new home', '📦', 'short', 'medium', 'savings', 2000, 10000, 90, false, 6),

-- TRANSPORTATION
('Vehicle Purchase', 'Buy a new or used vehicle', '🚗', 'medium', 'medium', 'purchase', 15000, 50000, 730, true, 7),
('Vehicle Repair Fund', 'Emergency fund for unexpected car repairs', '🔧', 'short', 'medium', 'savings', 1000, 5000, 180, false, 8),

-- EDUCATION
('College Fund', 'Tuition and expenses for higher education', '🎓', 'long', 'high', 'savings', 20000, 200000, 1825, true, 9),
('Professional Certification', 'Career certification or license program', '📜', 'short', 'medium', 'purchase', 500, 5000, 180, false, 10),
('Online Courses', 'Online learning and skill development', '💻', 'short', 'low', 'purchase', 100, 2000, 90, false, 11),

-- FAMILY & RELATIONSHIPS
('Wedding Fund', 'Wedding ceremony, reception, and honeymoon', '💒', 'medium', 'high', 'purchase', 10000, 100000, 730, true, 12),
('Baby Fund', 'Preparing for a new baby (nursery, supplies, medical)', '👶', 'medium', 'high', 'savings', 5000, 25000, 270, true, 13),
('Adoption Fund', 'Costs associated with adoption process', '🤱', 'medium', 'high', 'savings', 20000, 50000, 730, false, 14),

-- TRAVEL & EXPERIENCES
('Vacation Fund', 'Annual vacation or dream trip', '🏖️', 'short', 'medium', 'experience', 2000, 15000, 365, true, 15),
('International Trip', 'Major international travel experience', '✈️', 'medium', 'medium', 'experience', 5000, 20000, 545, true, 16),
('Weekend Getaways', 'Regular short trips and mini-vacations', '🗺️', 'short', 'low', 'experience', 500, 3000, 180, false, 17),

-- RETIREMENT & LONG-TERM
('Retirement Fund', 'Long-term retirement savings goal', '👴', 'long', 'critical', 'investment', 100000, 1000000, 7300, true, 18),
('Early Retirement (FIRE)', 'Financial Independence, Retire Early', '🔥', 'long', 'high', 'investment', 500000, 2000000, 3650, false, 19),

-- HEALTH & WELLNESS
('Medical Procedure', 'Elective or necessary medical procedure', '🏥', 'medium', 'high', 'savings', 3000, 50000, 365, false, 20),
('Dental Work', 'Major dental work (braces, implants, etc.)', '🦷', 'medium', 'medium', 'savings', 2000, 15000, 365, false, 21),
('Gym & Fitness', 'Gym membership, trainer, equipment', '💪', 'short', 'low', 'purchase', 500, 5000, 365, false, 22),

-- CAREER & BUSINESS
('Business Startup', 'Starting a new business venture', '🚀', 'medium', 'high', 'investment', 10000, 100000, 730, true, 23),
('Career Change Fund', 'Buffer for transitioning careers', '🔄', 'medium', 'medium', 'savings', 10000, 30000, 365, false, 24),
('Home Office Setup', 'Equipment and furniture for remote work', '🖥️', 'short', 'medium', 'purchase', 1000, 10000, 90, false, 25),

-- DEBT ELIMINATION
('Student Loan Payoff', 'Eliminate student loan debt', '🎓', 'long', 'high', 'debt_payoff', 10000, 100000, 1825, true, 26),
('Auto Loan Payoff', 'Pay off vehicle loan early', '🚗', 'medium', 'medium', 'debt_payoff', 5000, 40000, 730, false, 27),
('Mortgage Prepayment', 'Extra payments toward mortgage principal', '🏠', 'long', 'medium', 'debt_payoff', 10000, 100000, 3650, false, 28),

-- HOBBIES & RECREATION
('Photography Equipment', 'Camera, lenses, and photography gear', '📷', 'short', 'low', 'purchase', 1000, 10000, 180, false, 29),
('Music Equipment', 'Musical instruments or recording equipment', '🎸', 'medium', 'low', 'purchase', 500, 5000, 365, false, 30),
('Camping & Outdoor Gear', 'Tent, backpack, hiking equipment', '⛺', 'short', 'low', 'purchase', 500, 3000, 180, false, 31),

-- MAJOR PURCHASES
('Laptop/Computer', 'New computer or laptop purchase', '💻', 'short', 'medium', 'purchase', 1000, 3000, 180, false, 32),
('Furniture Purchase', 'New furniture for home', '🛋️', 'short', 'medium', 'purchase', 2000, 15000, 180, false, 33),
('Home Appliances', 'Major appliances (refrigerator, washer, etc.)', '🏠', 'short', 'medium', 'purchase', 1000, 5000, 90, false, 34),

-- PETS
('Pet Emergency Fund', 'Emergency veterinary care fund', '🐕', 'short', 'medium', 'savings', 1000, 5000, 180, false, 35),

-- SPECIAL EVENTS
('Holiday Shopping', 'Christmas/holiday gift fund', '🎄', 'short', 'medium', 'purchase', 500, 3000, 90, false, 36),
('Birthday Celebration', 'Special birthday party or celebration', '🎂', 'short', 'low', 'experience', 500, 5000, 180, false, 37),

-- INVESTMENT & WEALTH
('Stock Market Investment', 'Building investment portfolio', '📈', 'long', 'medium', 'investment', 5000, 100000, 1825, false, 38),
('Real Estate Investment', 'Down payment for investment property', '🏢', 'long', 'high', 'investment', 30000, 150000, 1825, false, 39),
('Cryptocurrency Portfolio', 'Digital asset investment', '💎', 'medium', 'medium', 'investment', 1000, 20000, 730, false, 40),

-- GIVING & LEGACY
('Charity Donation', 'Annual charitable giving goal', '🤲', 'short', 'low', 'experience', 500, 10000, 365, false, 41),
('Scholarship Fund', 'Create scholarship for students', '🎓', 'long', 'medium', 'savings', 10000, 100000, 1825, false, 42),

-- LUXURY & LIFESTYLE
('Luxury Purchase', 'High-end item or experience', '💎', 'medium', 'low', 'purchase', 5000, 50000, 365, false, 43),
('Designer Wardrobe', 'Investment in quality clothing', '👗', 'short', 'low', 'purchase', 2000, 10000, 180, false, 44),

-- LIFE TRANSITIONS
('Divorce Settlement', 'Financial preparation for divorce', '⚖️', 'short', 'critical', 'savings', 5000, 50000, 180, false, 45),
('Relocation Fund', 'Moving to a new city or state', '🚚', 'medium', 'high', 'savings', 5000, 20000, 180, false, 46),

-- AGE-SPECIFIC
('First Apartment', 'Deposit and setup for first apartment', '🔑', 'short', 'high', 'savings', 2000, 10000, 180, false, 47),
('Gap Year Travel', 'Year-long travel or sabbatical', '🎒', 'medium', 'medium', 'experience', 15000, 50000, 365, false, 48),
('Assisted Living Fund', 'Fund for senior care facility', '🏡', 'long', 'high', 'savings', 50000, 200000, 1825, false, 49),

-- MISCELLANEOUS
('Custom Goal', 'Create your own custom goal', '🎯', NULL, 'medium', 'savings', NULL, NULL, NULL, false, 50);

-- ============================================================================
-- Update usage statistics (simulated)
-- ============================================================================
UPDATE goal_categories SET usage_count = 8432 WHERE name = 'Emergency Fund';
UPDATE goal_categories SET usage_count = 5234 WHERE name = 'Home Down Payment';
UPDATE goal_categories SET usage_count = 4891 WHERE name = 'Wedding Fund';
UPDATE goal_categories SET usage_count = 4502 WHERE name = 'Vacation Fund';
UPDATE goal_categories SET usage_count = 3987 WHERE name = 'Vehicle Purchase';
UPDATE goal_categories SET usage_count = 3654 WHERE name = 'Credit Card Payoff';
UPDATE goal_categories SET usage_count = 3201 WHERE name = 'Baby Fund';
UPDATE goal_categories SET usage_count = 2987 WHERE name = 'College Fund';
UPDATE goal_categories SET usage_count = 2654 WHERE name = 'Retirement Fund';
UPDATE goal_categories SET usage_count = 2341 WHERE name = 'Business Startup';

-- ============================================================================
-- Verify insertion
-- ============================================================================
DO $$
DECLARE
  category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count FROM goal_categories;
  
  RAISE NOTICE '✅ Loaded % popular goal categories', category_count;
  RAISE NOTICE '';
  RAISE NOTICE '📊 Category Breakdown:';
  RAISE NOTICE '   • Financial Security: 3 categories';
  RAISE NOTICE '   • Housing: 3 categories';
  RAISE NOTICE '   • Transportation: 2 categories';
  RAISE NOTICE '   • Education: 3 categories';
  RAISE NOTICE '   • Family & Relationships: 3 categories';
  RAISE NOTICE '   • Travel & Experiences: 3 categories';
  RAISE NOTICE '   • Retirement: 2 categories';
  RAISE NOTICE '   • Health & Wellness: 3 categories';
  RAISE NOTICE '   • Career & Business: 3 categories';
  RAISE NOTICE '   • Debt Elimination: 3 categories';
  RAISE NOTICE '   • And 20+ more categories!';
  RAISE NOTICE '';
  RAISE NOTICE '📌 Next Step: Create TypeScript types and service layer';
  RAISE NOTICE '📄 See: types/goal-extended.ts';
END $$;

-- ============================================================================
-- Helper Query: View most popular categories
-- ============================================================================
-- Run this to see featured categories:
-- SELECT name, icon, usage_count, timeframe_default, suggested_amount_min, suggested_amount_max 
-- FROM goal_categories 
-- WHERE is_featured = true 
-- ORDER BY usage_count DESC;

