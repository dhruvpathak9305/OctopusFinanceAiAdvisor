# Group Detail Screen - Member Balance Breakdown

## 🎯 Feature Overview

When users click on a group card in the Money Ties section, they can now see a **detailed breakdown** of individual member balances, showing exactly who paid what and who owes what within the group.

---

## 📱 User Flow

1. **Navigate to Money Ties** → Relationships Tab
2. **Filter by Groups** (or view all)
3. **Tap on any group card** (e.g., "Test", "GOB")
4. **View Member Balances** - Detailed breakdown appears

---

## 🎨 UI Design

### Header Section
- **Group Name** (e.g., "Test")
- **Group Balance**: Shows net amount
  - **"To recover: ₹199.98"** (if positive - others owe group members)
  - **"You owe: ₹XX.XX"** (if negative - you owe group members)
- **Action Buttons** (Request Payment, Record Payment)

### Member Balances Section
**Title**: "MEMBER BALANCES"  
**Subtitle**: "Individual breakdown of who paid what and who owes what"

**Each Member Card Shows**:
- 👤 **Member Icon** with name and email
- **Paid**: Total amount they paid for group expenses
- **Share**: Their portion of total group expenses
- **Net Balance** (if non-zero):
  - **"Others owe them: ₹XX.XX"** (green, if they paid more than their share)
  - **"They owe: ₹XX.XX"** (red, if they paid less than their share)

### Group Info Section
- **Total Members**: Number of people in group
- **Active Splits**: Number of unpaid split transactions
- **Last Activity**: Date of last transaction

---

## 📊 Data Calculations

### How Balances Are Calculated

1. **Total Paid**: Sum of all transactions the member paid for the group
2. **Total Owed**: Member's share of all group expenses
3. **Net Balance** = Total Paid - Total Owed
   - **Positive**: Others owe this member
   - **Negative**: This member owes others
   - **Zero**: All settled

### Example

**Scenario**: Three friends split a ₹100 expense equally

| Member | Paid | Share | Net Balance |
|--------|------|-------|-------------|
| Alice  | ₹100 | ₹33.33 | +₹66.67 (others owe her) |
| Bob    | ₹0   | ₹33.33 | -₹33.33 (he owes) |
| Charlie| ₹0   | ₹33.34 | -₹33.34 (he owes) |

**Group Net Balance**: ₹66.67 to recover (from Alice's perspective)

---

## 🏗️ Technical Implementation

### New Service Method

**File**: `services/groupFinancialService.ts`

```typescript
async getGroupMemberBalances(groupId: string): Promise<{
  data: GroupMemberBalance[] | null;
  error: GroupFinancialServiceError | null;
}>
```

**Calls Database Function**: `get_group_balances(p_group_id)`

**Returns**:
```typescript
interface GroupMemberBalance {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  total_paid: number;
  total_owed: number;
  net_balance: number;
}
```

### Modified Components

#### 1. `RelationshipDetail.tsx`
**Changes**:
- Added `isGroup` prop
- Added `groupData` and `memberBalances` state
- Modified `loadRelationshipDetails` to fetch group data when `isGroup === true`
- Added `renderMemberBalanceItem()` function
- Conditional rendering: Shows member balances for groups, individual transactions for persons

#### 2. `index.tsx` (Financial Relationships)
**Changes**:
- Added `selectedIsGroup` state
- Modified `handleSelectRelationship(relationshipId, isGroup)`
- Passes `isGroup` prop to `RelationshipDetail`

#### 3. `RelationshipList.tsx`
**Changes**:
- Modified `onPress` to call `onSelectRelationship(item.id, isGroup)`

---

## 🗄️ Database

### Function Used
**Name**: `get_group_balances(p_group_id UUID)`  
**Location**: `database/group-expense-splitting/04_splitting_functions.sql`

**SQL Logic**:
```sql
WITH group_transactions AS (
  -- Get all transactions for this group
  SELECT DISTINCT ts.transaction_id
  FROM transaction_splits ts
  WHERE ts.group_id = p_group_id
),
user_payments AS (
  -- Sum up what each user paid
  SELECT t.user_id, SUM(t.amount) as total_paid
  FROM transactions_real t
  INNER JOIN group_transactions gt ON t.id = gt.transaction_id
  GROUP BY t.user_id
),
user_shares AS (
  -- Sum up each user's share of expenses
  SELECT ts.user_id, SUM(ts.share_amount) as total_owed
  FROM transaction_splits ts
  WHERE ts.group_id = p_group_id
  GROUP BY ts.user_id
)
-- Calculate net balance
SELECT 
  user_id,
  user_name,
  user_email,
  total_paid,
  total_owed,
  (total_paid - total_owed) as net_balance
...
```

---

## 🎯 Key Features

### 1. **Individual Member Tracking**
- See exactly who paid how much
- Track each person's share of expenses
- Calculate who owes whom

### 2. **Visual Clarity**
- **Green** for positive balances (to recover)
- **Red** for negative balances (you owe)
- **Gray/Hidden** for settled members (₹0.00)

### 3. **Comprehensive Group Info**
- Member count
- Active splits count
- Last activity timestamp

### 4. **Real-Time Data**
- Fetches live data from database
- Uses optimized database functions
- Efficient calculations

---

## 🧪 Testing

### Test Scenarios

1. **Group with Balanced Split**
   - All members paid their equal share
   - ✅ All net balances should be ₹0.00 (or very close)

2. **Group with One Payer**
   - One person paid for everyone
   - ✅ That person should show positive balance
   - ✅ Others should show negative balances
   - ✅ Sum of all balances = 0

3. **Group with Multiple Payers**
   - Different people paid different amounts
   - ✅ Net balances correctly reflect who owes whom

4. **Empty Group**
   - No transactions yet
   - ✅ Shows "No member balances found"

5. **Group with Guest Users**
   - Includes non-registered participants
   - ✅ Guest names displayed correctly

---

## 📝 Console Logs

When loading group details, you should see:

```
[RelationshipDetail] Loading group data for: <group_id>
[GroupFinancialService] Fetching groups for user: <user_id>
[GroupFinancialService] Fetched splits for group: <group_id> Count: 3
[GroupFinancialService] Processing 3 splits for user: <user_id>
[GroupFinancialService] Calculated financials for group: <group_id> {
  total_splits: 3,
  total_owed_to_you: 66.66,
  total_you_owe: 0,
  net_balance: 66.66
}
[GroupFinancialService] Fetching member balances for group: <group_id>
[GroupFinancialService] Fetched 3 member balances
```

---

## 🚀 Benefits

1. **Transparency**: Everyone knows exactly who paid what
2. **Accountability**: Clear tracking of who owes money
3. **Convenience**: No need to manually calculate splits
4. **Trust**: All calculations are based on actual transaction data
5. **Fairness**: Mathematical accuracy ensures fair splitting

---

## 🔄 Related Features

- **Group Creation** (`FinancialDashboard.tsx`)
- **Group Member Management** (`GroupManagement.tsx`)
- **Transaction Splitting** (`SplitCalculator.tsx`)
- **Financial Relationship Tracking** (`FinancialRelationshipService`)

---

## 📌 Future Enhancements

1. **Settlement Suggestions**: "Bob should pay Alice ₹50 to settle"
2. **Export Breakdown**: Download group balance report
3. **Notifications**: Remind members when they owe money
4. **Payment History**: Show past settlements
5. **Category Breakdown**: See which expense categories members spent on

---

**Implemented**: October 25, 2025  
**Impact**: High - Provides essential visibility into group finances  
**Files Modified**: 4 (service, 3 components)  
**New Service Method**: `getGroupMemberBalances()`  
**Database Function**: `get_group_balances()`

