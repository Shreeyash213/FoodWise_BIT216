export type FoodItem = {
  id: string;
  name: string;
  category: "Produce" | "Dairy" | "Pantry" | "Frozen" | "Meat" | "Bakery";
  quantity: number;
  unit: string;
  location: "Fridge" | "Freezer" | "Pantry Shelf";
  daysLeft: number;
  addedBy: string;
  lowStockThreshold: number;
};

export type NotificationItem = {
  id: string;
  tone: "expiry" | "low-stock" | "plan" | "system" | "update";
  message: string;
  isRead?: boolean;
  time?: string;
  createdAt?: string;
};

export type MealSlot = {
  id?: string;
  day: string;
  meal: string;
  usesExpiring: boolean;
};

export type HouseholdMember = {
  id?: string;
  name: string;
  role: string;
  privacy: string;
};

export const seedInventory: FoodItem[] = [
  { id: "i1", name: "Whole Milk", category: "Dairy", quantity: 1, unit: "L", location: "Fridge", daysLeft: 2, addedBy: "Asha", lowStockThreshold: 2 },
  { id: "i2", name: "Spinach", category: "Produce", quantity: 200, unit: "g", location: "Fridge", daysLeft: 1, addedBy: "Asha", lowStockThreshold: 300 },
  { id: "i3", name: "Basmati Rice", category: "Pantry", quantity: 5, unit: "kg", location: "Pantry Shelf", daysLeft: 180, addedBy: "Ram", lowStockThreshold: 2 },
  { id: "i4", name: "Chicken Thighs", category: "Meat", quantity: 800, unit: "g", location: "Freezer", daysLeft: 45, addedBy: "Ram", lowStockThreshold: 500 },
  { id: "i5", name: "Greek Yogurt", category: "Dairy", quantity: 500, unit: "g", location: "Fridge", daysLeft: 4, addedBy: "Nisha", lowStockThreshold: 200 },
  { id: "i6", name: "Sourdough Loaf", category: "Bakery", quantity: 1, unit: "loaf", location: "Pantry Shelf", daysLeft: 3, addedBy: "Nisha", lowStockThreshold: 1 },
  { id: "i7", name: "Frozen Peas", category: "Frozen", quantity: 400, unit: "g", location: "Freezer", daysLeft: 90, addedBy: "Ram", lowStockThreshold: 200 },
  { id: "i8", name: "Tomatoes", category: "Produce", quantity: 6, unit: "pcs", location: "Fridge", daysLeft: 5, addedBy: "Asha", lowStockThreshold: 3 },
  { id: "i9", name: "Turmeric Powder", category: "Pantry", quantity: 150, unit: "g", location: "Pantry Shelf", daysLeft: 300, addedBy: "Ram", lowStockThreshold: 50 },
  { id: "i10", name: "Cheddar Block", category: "Dairy", quantity: 250, unit: "g", location: "Fridge", daysLeft: 12, addedBy: "Nisha", lowStockThreshold: 100 },
];

export const seedNotifications: NotificationItem[] = [
  { id: "n1", tone: "expiry", message: "Spinach expires tomorrow — use in tonight's dal.", isRead: false, time: "10 min ago" },
  { id: "n2", tone: "expiry", message: "Whole Milk expires in 2 days.", isRead: false, time: "1 hr ago" },
  { id: "n3", tone: "low-stock", message: "Basmati Rice is running low — 5 kg left, add to shopping list?", isRead: false, time: "3 hr ago" },
  { id: "n4", tone: "plan", message: "Thursday's dinner (Chicken Curry) still needs 2 ingredients.", isRead: true, time: "Yesterday" },
  { id: "n5", tone: "system", message: "Weekly freshness report is ready to view.", isRead: true, time: "Yesterday" },
];

export const seedMealPlan: MealSlot[] = [
  { id: "m1", day: "Mon", meal: "Spinach & Paneer Curry", usesExpiring: true },
  { id: "m2", day: "Tue", meal: "Tomato Basil Pasta", usesExpiring: true },
  { id: "m3", day: "Wed", meal: "Fried Rice with Peas", usesExpiring: false },
  { id: "m4", day: "Thu", meal: "Chicken Curry", usesExpiring: false },
  { id: "m5", day: "Fri", meal: "Sourdough Grilled Cheese", usesExpiring: true },
  { id: "m6", day: "Sat", meal: "Yogurt Marinated Chicken", usesExpiring: true },
  { id: "m7", day: "Sun", meal: "Leftovers & Pantry Clean-out", usesExpiring: false },
];

export const seedHouseholdMembers: HouseholdMember[] = [
  { id: "h1", name: "Asha", role: "Owner", privacy: "Shares full inventory" },
  { id: "h2", name: "Ram", role: "Member", privacy: "Shares full inventory" },
  { id: "h3", name: "Nisha", role: "Member", privacy: "Shares purchases only" },
];

// Fallback exports for backward compatibility
export const inventory = seedInventory;
export const notifications = seedNotifications;
export const mealPlan = seedMealPlan;
export const householdMembers = seedHouseholdMembers;

export const wasteByCategory = [
  { category: "Produce", percent: 42 },
  { category: "Dairy", percent: 24 },
  { category: "Bakery", percent: 16 },
  { category: "Meat", percent: 10 },
  { category: "Frozen", percent: 5 },
  { category: "Pantry", percent: 3 },
];

export const monthlyWasteTrend = [18, 22, 15, 19, 12, 9, 7];

export function computeStats(items: FoodItem[], slots: MealSlot[] = seedMealPlan) {
  const itemsTracked = items.length;
  const expiringSoon = items.filter((i) => i.daysLeft <= 3).length;
  const mealsPlanned = slots.length;
  const lowStockItems = items.filter((i) => i.quantity <= (i.lowStockThreshold ?? 2)).length;

  // Compute freshest item dynamically
  const sortedByFreshness = [...items].sort((a, b) => b.daysLeft - a.daysLeft);
  const freshest = sortedByFreshness[0];
  const freshestItem = freshest
    ? { name: freshest.name, daysLeft: freshest.daysLeft }
    : { name: "None logged", daysLeft: 0 };

  // Compute urgent alert dynamically
  const sortedByUrgency = [...items].sort((a, b) => a.daysLeft - b.daysLeft);
  const urgent = sortedByUrgency[0];
  const nextAlert = urgent
    ? { title: `${urgent.name} expires soon`, desc: `Only ${urgent.daysLeft} day(s) left — use soon.` }
    : { title: "No urgent alerts", desc: "Your kitchen is fully stocked." };

  return {
    itemsTracked,
    expiringSoon,
    mealsPlanned,
    lowStockItems,
    freshestItem,
    nextAlert,
  };
}

export function computeAnalytics(items: FoodItem[]) {
  if (!items.length) {
    return {
      wasteByCategory,
      monthlyWasteTrend,
      wasteRate: 7,
      topCulprit: "Produce",
      lowStockCount: 0,
      totalItems: 0,
      freshnessRate: 100,
    };
  }

  const categoryCounts: Record<string, number> = {};
  items.forEach((item) => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  const total = items.length;
  const allCategories = ["Produce", "Dairy", "Bakery", "Meat", "Frozen", "Pantry"] as const;
  
  const computedWasteByCategory = allCategories.map((cat) => {
    const count = categoryCounts[cat] || 0;
    const percent = Math.round((count / total) * 100);
    return { category: cat, percent };
  }).sort((a, b) => b.percent - a.percent);

  const topCulprit = computedWasteByCategory[0]?.category || "Produce";
  const expiringCount = items.filter((i) => i.daysLeft <= 3).length;
  const wasteRate = Math.min(100, Math.round((expiringCount / total) * 100) || 7);
  const lowStockCount = items.filter((i) => i.quantity <= (i.lowStockThreshold ?? 2)).length;
  const freshCount = items.filter((i) => i.daysLeft > 3).length;
  const freshnessRate = Math.round((freshCount / total) * 100) || 100;

  return {
    wasteByCategory: computedWasteByCategory,
    monthlyWasteTrend: [18, 22, 15, 19, 12, 9, wasteRate],
    wasteRate,
    topCulprit,
    lowStockCount,
    totalItems: total,
    freshnessRate,
  };
}

export const stats = computeStats(seedInventory, seedMealPlan);
