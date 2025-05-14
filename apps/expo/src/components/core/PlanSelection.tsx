import { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

interface Product {
  identifier: string;
}

interface PurchasesPackage {
  product: Product;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  popular?: boolean;
  packageId: string;
}

interface PlanSelectionProps {
  plans: Record<string, Plan>;
  packages: PurchasesPackage[];
  selectedPackage?: PurchasesPackage;
  onSelectPackage: (pkg: PurchasesPackage) => void;
}

export const PlanSelection = memo(({ 
  plans, 
  packages, 
  selectedPackage, 
  onSelectPackage 
}: PlanSelectionProps) => (
  <View style={styles.planContainer}>
    {Object.keys(plans).length > 0 ? (
      Object.values(plans).map((plan) => (
        <Pressable
          key={plan.id}
          onPress={() => {
            const pkg = packages.find(
              (pkg) => pkg.product.identifier === plan.packageId,
            );
            if (pkg) {
              onSelectPackage(pkg);
            }
          }}
          style={[
            styles.planBox,
            selectedPackage?.product.identifier === plan.packageId &&
              styles.selectedPlanBox,
            plan.id === "weekly" ? { marginRight: 8 } : { marginLeft: 8 },
          ]}
        >
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
          <View style={styles.planContent}>
            <View>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                selectedPackage?.product.identifier === plan.packageId &&
                  styles.selectedRadioOuter,
              ]}
            >
              {selectedPackage?.product.identifier === plan.packageId && (
                <View style={styles.radioInner} />
              )}
            </View>
          </View>
        </Pressable>
      ))
    ) : (
      <View style={[styles.planBox, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.planName, { color: 'rgba(255,255,255,0.5)' }]}>Loading plans...</Text>
      </View>
    )}
  </View>
));

const styles = StyleSheet.create({
  planContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  planBox: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    position: "relative",
  },
  selectedPlanBox: {
    backgroundColor: "white",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 16,
    backgroundColor: "#f472b6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: "white",
    fontSize: 12,
    fontFamily: "inter-medium",
  },
  planContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: {
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 4,
    fontFamily: "inter-semibold",
  },
  planPrice: {
    fontSize: 14,
    color: "#4b5563",
    fontFamily: "inter-medium",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedRadioOuter: {
    borderColor: "#f472b6",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f472b6",
  },
}); 