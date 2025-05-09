"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@omc/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@omc/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@omc/ui/alert";
import { AlertCircle, Trash2, ShieldAlert, CheckCircle2, Mail } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@omc/ui/alert-dialog";
import { Input } from "@omc/ui/input";
import { Label } from "@omc/ui/label";
import { RadioGroup, RadioGroupItem } from "@omc/ui/radio-group";
import { Checkbox } from "@omc/ui/checkbox";
import Image from "next/image";
import { z } from "zod";

interface ApiResponse {
  message: string;
}

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type DeletionType = "full" | "partial";

const dataOptions = [
  { id: "workout", label: "Workout plans and progress" },
  { id: "meal", label: "Meal plans and nutrition data" },
  { id: "profile", label: "Profile information" },
  { id: "preferences", label: "App preferences and settings" },
] as const;

export default function DeleteAccountPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deletionType, setDeletionType] = useState<DeletionType>("full");
  const [selectedData, setSelectedData] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const validationResult = emailSchema.safeParse({ email });
  const isValidEmail = validationResult.success;
  const hasSelectedData = Object.values(selectedData).some(Boolean);

  const handleDeleteAccount = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Please enter a valid email address");
      return;
    }

    if (deletionType === "partial" && !hasSelectedData) {
      setError("Please select at least one data type to delete");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (deletionType === "full") {
        const response = await fetch("/api/admin/delete-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-email": "chisom@omnicentra.com",
          },
          body: JSON.stringify({ email }),
        });

        const data = (await response.json()) as ApiResponse;

        if (!response.ok) {
          throw new Error(data.message);
        }

        setIsSuccess(true);
      } else {
        // For partial deletion, compose email
        const selectedItems = Object.entries(selectedData)
          .filter(([_, selected]) => selected)
          .map(([id]) => dataOptions.find(opt => opt.id === id)?.label)
          .filter(Boolean);

        const mailtoLink = `mailto:chisomt@omnicentra.com?subject=Data Deletion Request&body=Hello,%0A%0AI would like to request deletion of the following data from my account:%0A%0A${selectedItems.join("%0A")}%0A%0AEmail: ${email}%0A%0AThank you.`;
        window.location.href = mailtoLink;
        setIsSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container max-w-2xl py-12">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logo-pink.png"
            alt="Snatched AI Logo"
            width={120}
            height={120}
            className="rounded-full"
          />
        </div>

        <Card className="border-2 border-red-100 dark:border-red-900/50">
          <CardHeader className="space-y-4 border-b border-red-100 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
              <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                Delete Account
              </CardTitle>
            </div>
            <CardDescription className="text-base text-red-600/80 dark:text-red-400/80">
              We're sorry to see you go. Please read the information below carefully before proceeding.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
                  What would you like to do?
                </Label>
                <RadioGroup
                  value={deletionType}
                  onValueChange={(value: string) => setDeletionType(value as DeletionType)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full" className="text-gray-700 dark:text-gray-300">
                      Delete my entire account and all data
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="partial" />
                    <Label htmlFor="partial" className="text-gray-700 dark:text-gray-300">
                      Delete specific data only
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {deletionType === "full" ? (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
                    What happens when you delete your account:
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-500" />
                      All your personal data will be permanently deleted
                    </li>
                    <li className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-500" />
                      Your workout plans and progress will be removed
                    </li>
                    <li className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-500" />
                      Your meal plans and nutrition data will be erased
                    </li>
                    <li className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-500" />
                      This action cannot be undone
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
                    Select the data you want to delete:
                  </h3>
                  <div className="space-y-3">
                    {dataOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={selectedData[option.id] ?? false}
                          onCheckedChange={(checked: boolean) =>
                            setSelectedData((prev) => ({
                              ...prev,
                              [option.id]: checked,
                            }))
                          }
                        />
                        <Label
                          htmlFor={option.id}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm your email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    className={`pl-10 ${!isValidEmail && email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Please enter the email address associated with your account to confirm deletion.
                </p>
                {!isValidEmail && email && (
                  <p className="text-xs text-red-500">
                    {validationResult.error.errors[0]?.message}
                  </p>
                )}
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    disabled={isLoading || !isValidEmail || (deletionType === "partial" && !hasSelectedData)}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletionType === "full" ? "Delete My Account" : "Request Data Deletion"}
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 dark:text-red-400">
                      {deletionType === "full" ? "Are you absolutely sure?" : "Confirm Data Deletion Request"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                      {deletionType === "full" 
                        ? "This action cannot be undone. This will permanently delete your account and remove all associated data from our servers."
                        : "Your request will be sent to our support team. We will process your data deletion request within 30 days."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                      disabled={isLoading}
                    >
                      {deletionType === "full" ? "Yes, delete my account" : "Yes, send request"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                If you're having issues with your account, please contact our support team before deleting.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isSuccess} onOpenChange={setIsSuccess}>
        <AlertDialogContent className="border-2 border-pink-100 dark:border-pink-900/50">
          <AlertDialogHeader>
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-pink-500 dark:text-pink-400" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold text-pink-600 dark:text-pink-400">
              {deletionType === "full" ? "Account Deleted Successfully" : "Request Sent Successfully"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 dark:text-gray-300">
              {deletionType === "full"
                ? "Your account and all associated data have been permanently deleted. Thank you for being a part of the Snatched AI community."
                : "Your data deletion request has been sent to our support team. We will process your request within 30 days."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row">
            <AlertDialogAction
              onClick={handleSuccessClose}
              className="w-full bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-800"
            >
              Return to Home
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 