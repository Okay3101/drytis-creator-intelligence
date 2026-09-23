export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Otp: { email: string };
  ForgotPassword: undefined;
  CreatorTabs: undefined;
  BrandTabs: undefined;
};

export type CreatorTabParamList = {
  Home: undefined;
  Diagnose: undefined;
  Create: undefined;
  Trends: undefined;
  Profile: undefined;
};

export type BrandTabParamList = {
  BrandHome: undefined;
  Campaigns: undefined;
  BrandProfile: undefined;
};

export type CreatorStackParamList = {
  CreatorTabs: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Support: undefined;
  NotificationPrefs: undefined;
  Readiness: undefined;
};

export type BrandStackParamList = {
  BrandTabs: undefined;
  CreateCampaign: undefined;
  CampaignDetail: { id: number };
  BrandEditProfile: undefined;
  BrandChangePassword: undefined;
  BrandSupport: undefined;
};
