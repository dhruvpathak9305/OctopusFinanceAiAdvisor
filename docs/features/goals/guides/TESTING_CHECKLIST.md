# 🧪 Goals Feature - Testing Checklist

## ✅ Database Setup Complete!

You've successfully run:
- ✅ `001_create_core_goals_tables.sql` - Created 4 tables
- ✅ `002_load_popular_categories.sql` - Loaded 65 categories

---

## 📱 **STEP 1: Reload Your App**

In your Metro terminal, press:
```
r
```

Or restart with:
```bash
npx expo start --clear
```

---

## 🎯 **STEP 2: Test Goal Creation**

### **Create Your First Goal:**

1. ✅ **Open the Goals screen** in your app

2. ✅ **Check for loading state**
   - Should briefly show "Loading goals..."
   - Then show empty state or existing goals

3. ✅ **Tap "+ New Goal"** button (top right)

4. ✅ **Select Timeframe:**
   - Tap **"Short"** (⚡ ~1 year)

5. ✅ **Choose Category:**
   - Scroll down to "📂 Choose Category"
   - Should see categories filtered by "Short-term"
   - Tap **"Emergency Fund 🛡️"**
   - Category section should collapse showing your selection

6. ✅ **Enter Goal Name:**
   - Tap the "Goal Name *" field
   - Type: **"Emergency Savings Fund"**

7. ✅ **Enter Target Amount:**
   - Tap the "Target Amount *" field
   - Type: **"5000"**

8. ✅ **Select Target Date:**
   - Tap the date field (shows current date)
   - Date picker should appear inline below
   - Scroll to select a date 6 months from now
   - Tap **"Done ✓"** button

9. ✅ **Create the Goal:**
   - Tap **"✨ Create Goal"** button at bottom
   - Should see **"Success"** alert: "Goal created successfully!"
   - Tap "OK"

10. ✅ **Verify Goal Appears:**
    - Modal should close
    - **Your new goal should appear in the list!**
    - Should show:
      - 🛡️ Emergency Savings Fund
      - Progress ring at 0%
      - $0 / $5,000
      - Status: "On Track"
      - Days remaining
      - Short badge (⚡ Short)

---

## 💰 **STEP 3: Test Adding Contribution**

1. ✅ **Find your goal** in the list

2. ✅ **Tap "💰 Add"** button on the goal card

3. ✅ **Contribution Modal Opens:**
   - Should show goal name and remaining amount
   - Quick amount buttons ($50, $100, $250, $500)

4. ✅ **Add Contribution:**
   - Tap **"$100"** quick button (or enter custom amount)
   - Tap **"Add Contribution"**
   - Should see **"Success"** alert: "Added $100 to Emergency Savings Fund!"

5. ✅ **Verify Update:**
   - Goal card should update automatically
   - Current amount: **$100**
   - Progress ring: **2%** (100/5000)
   - Progress bar should show 2%

---

## 🔍 **STEP 4: Test Goal Details**

1. ✅ **Tap "Details"** button on the goal card

2. ✅ **Details Modal Opens:**
   - Should show full goal information
   - Financial details (current, target, remaining)
   - Timeline (target date, days remaining)
   - Milestones (0 of 4 completed)

3. ✅ **Test Edit Button:**
   - Tap **"✏️ Edit Goal"**
   - Should show **"Coming Soon"** alert (feature planned for Phase 2)
   - Tap "OK"

4. ✅ **Close Details:**
   - Tap the **"✕"** button to close

---

## ♻️ **STEP 5: Test Pull-to-Refresh**

1. ✅ **Pull down on the goals list**
   - Should see refresh spinner
   - Goals should reload from database
   - Spinner disappears after loading

---

## 🗑️ **STEP 6: Test Goal Deletion**

1. ✅ **Tap "Details"** on the test goal

2. ✅ **Tap "🗑️ Delete Goal"** button

3. ✅ **Confirm Deletion:**
   - Should see **"Deleted"** alert
   - Goal removed from list
   - Modal closes automatically

---

## 🗄️ **STEP 7: Verify in Database**

### **Open Supabase SQL Editor:**
https://supabase.com/dashboard/project/fzzbfgnmbchhmqepwmer/sql/new

### **Run this query:**
```sql
-- Check your goals
SELECT 
  id,
  name,
  emoji,
  timeframe,
  target_amount,
  current_amount,
  progress_percentage,
  status,
  target_date,
  created_at
FROM goals
ORDER BY created_at DESC;
```

**Expected Result:**
- Should see your "Emergency Savings Fund" goal
- `current_amount`: 100.00 (if you added $100)
- `progress_percentage`: 2.00
- `status`: 'active'

### **Check contributions:**
```sql
-- Check contributions
SELECT 
  gc.amount,
  gc.contribution_type,
  gc.contributed_at,
  g.name as goal_name
FROM goal_contributions gc
JOIN goals g ON g.id = gc.goal_id
ORDER BY gc.contributed_at DESC;
```

**Expected Result:**
- Should see $100 contribution
- `contribution_type`: 'manual'
- `goal_name`: 'Emergency Savings Fund'

### **Check categories loaded:**
```sql
-- Verify categories
SELECT COUNT(*) as total FROM goal_categories;
SELECT name, icon, timeframe_default FROM goal_categories LIMIT 10;
```

**Expected Result:**
- Total: **65 categories**
- Should see Emergency Fund, Vacation, etc.

---

## ✅ **Success Criteria**

After testing, you should have:
- [x] Created a goal successfully
- [x] Goal visible in UI list
- [x] Added a contribution
- [x] Progress updated automatically
- [x] Viewed goal details
- [x] Deleted a goal
- [x] Data persisted in Supabase database

---

## 🎨 **STEP 8: Create More Goals (Optional)**

Try creating different types of goals:

### **Short-term Goal:**
- Timeframe: Short
- Category: Vacation Fund 🏖️
- Name: "Summer Vacation 2025"
- Amount: $3,000
- Date: 6 months from now

### **Medium-term Goal:**
- Timeframe: Medium
- Category: Home Down Payment 🏡
- Name: "House Down Payment"
- Amount: $50,000
- Date: 3 years from now

### **Long-term Goal:**
- Timeframe: Long
- Category: Retirement 🏖️
- Name: "Retirement Fund"
- Amount: $500,000
- Date: 20 years from now

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: "Loading goals..." never finishes**
**Solution:**
- Check Metro terminal for errors
- Verify Supabase connection (check `lib/supabase/client.ts`)
- Try refreshing the app (`r` in Metro)

### **Issue 2: "Failed to create goal" error**
**Possible causes:**
- Database RLS policies blocking insert
- Missing user authentication
- Network error

**Solution:**
```sql
-- Check RLS policies are correct
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'goals';
```

### **Issue 3: Goal created but not appearing**
**Solution:**
- Pull down to refresh
- Check if goal was actually saved:
  ```sql
  SELECT * FROM goals ORDER BY created_at DESC LIMIT 1;
  ```
- Check console logs for fetch errors

### **Issue 4: Date picker not working**
**Solution:**
- We fixed this! Should work inline now
- If still issues, check console for errors
- Make sure `@react-native-community/datetimepicker` is installed

---

## 📊 **Performance Check**

### **Should be FAST:**
- ✅ Goal creation: < 1 second
- ✅ Loading goals: < 2 seconds
- ✅ Adding contribution: < 1 second
- ✅ Deleting goal: < 1 second

### **If slow:**
- Check network connection
- Check Supabase dashboard for slow queries
- Check database indexes are created

---

## 🎉 **Next Steps (After Testing)**

Once everything works:

1. ✅ **Mark this feature as complete!**
2. 🚀 **Start using it for real goals**
3. 📝 **Plan Phase 2 enhancements:**
   - Edit goals
   - More categories
   - Goal analytics
   - Linked bank accounts
   - Milestones tracking
   - AI predictions

---

## 💬 **Report Results**

After testing, tell me:

1. ✅ **What worked?**
2. ❌ **Any errors?** (send exact error messages)
3. 🐛 **Any bugs?** (unexpected behavior)
4. 💡 **Any suggestions?** (improvements, features)

---

## 🎯 **Ready to Test!**

1. Press **'r'** in Metro terminal to reload
2. Open Goals screen
3. Follow the checklist above
4. Let me know how it goes! 🚀

