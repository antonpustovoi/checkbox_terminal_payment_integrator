import { UnavailabilityError } from "expo-modules-core";

import ExpoIntentLauncher from "./ExpoIntentLauncher";

export interface IntentLauncherParams {
  /**
   * A string specifying the MIME type of the data represented by the data parameter. Ignore this
   * argument to allow Android to infer the correct MIME type.
   */
  type?: string;
  /**
   * Category provides more details about the action the intent performs. See [`Intent.addCategory`](https://developer.android.com/reference/android/content/Intent#addCategory(java.lang.String)).
   */
  category?: string;
  /**
   * A map specifying additional key-value pairs which are passed with the intent as `extras`.
   * The keys must include a package prefix, for example the app `com.android.contacts` would use
   * names like `com.android.contacts.ShowAll`.
   */
  extra?: Record<string, any>;
  /**
   * A URI specifying the data that the intent should operate upon. (_Note:_ Android requires the URI
   * scheme to be lowercase, unlike the formal RFC.)
   */
  data?: string;
  /**
   * Bitmask of flags to be used. See [`Intent.setFlags`](https://developer.android.com/reference/android/content/Intent#setFlags(int)) for more details.
   */
  flags?: number;
  /**
   * Package name used as an identifier of ComponentName. Set this only if you want to explicitly
   * set the component to handle the intent.
   */
  packageName?: string;
  /**
   * Class name of the ComponentName.
   */
  className?: string;
}

export interface IntentLauncherResult {
  /**
   * Result code returned by the activity.
   */
  resultCode: ResultCode;
  /**
   * Optional data URI that can be returned by the activity.
   */
  data?: string;
  /**
   * Optional extras object that can be returned by the activity.
   */
  extra?: object;
}

export enum ResultCode {
  /**
   * Indicates that the activity operation succeeded.
   */
  Success = -1,
  /**
   * Means that the activity was canceled, for example, by tapping on the back button.
   */
  Canceled = 0,
  /**
   * First custom, user-defined value that can be returned by the activity.
   */
  FirstUser = 1,
}

// @needsAudit
/**
 * Starts the specified activity. The method will return a promise which resolves when the user
 * returns to the app.
 * @param activityAction The action to be performed, for example, `IntentLauncher.ActivityAction.WIRELESS_SETTINGS`.
 * There are a few pre-defined constants you can use for this parameter.
 * You can find them at [`expo-intent-launcher/src/IntentLauncher.ts`](https://github.com/expo/expo/blob/main/packages/expo-intent-launcher/src/IntentLauncher.ts).
 * @param params An object of intent parameters.
 * @return A promise which fulfils with `IntentLauncherResult` object.
 */
export async function startActivityAsync(
  activityAction: string,
  params: IntentLauncherParams = {}
): Promise<IntentLauncherResult> {
  if (!ExpoIntentLauncher.startActivity) {
    throw new UnavailabilityError("IntentLauncher", "startActivityAsync");
  }
  if (!activityAction || typeof activityAction !== "string") {
    throw new TypeError(
      `'activityAction' argument must be a non-empty string!`
    );
  }
  return ExpoIntentLauncher.startActivity(activityAction, params);
}
