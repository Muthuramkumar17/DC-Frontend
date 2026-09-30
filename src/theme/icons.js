/**
 * theme/icons.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for all MUI icon imports in the application.
 *
 * Two export styles:
 *   1. Named exports  – used by features/components:
 *      import { AddIcon, SearchIcon } from "@/theme/icons";
 *
 *   2. `Icons` object – retained for backward-compat with the original
 *      marketing/landing usage (theme.Icons.arrowback, etc.)
 *
 * ADD new icons here — never import @mui/icons-material directly in JSX files.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Navigation & Layout ───────────────────────────────────────────────────────
export { default as MenuIcon } from "@mui/icons-material/Menu";
export { default as ExpandLessIcon } from "@mui/icons-material/ExpandLess";
export { default as ExpandMoreIcon } from "@mui/icons-material/ExpandMore";
export { default as ChevronLeftIcon } from "@mui/icons-material/ChevronLeft";
export { default as ChevronRightIcon } from "@mui/icons-material/ChevronRight";
export { default as NavigateNextIcon } from "@mui/icons-material/NavigateNext";
export { default as HomeOutlinedIcon } from "@mui/icons-material/HomeOutlined";

// ── CRUD Actions ──────────────────────────────────────────────────────────────
export { default as AddIcon } from "@mui/icons-material/Add";
export { default as EditIcon } from "@mui/icons-material/Edit";
export { default as EditOutlinedIcon } from "@mui/icons-material/EditOutlined";
export { default as SaveIcon } from "@mui/icons-material/Save";
export { default as DeleteIcon } from "@mui/icons-material/Delete";
export { default as CloseIcon } from "@mui/icons-material/Close";
export { default as RefreshIcon } from "@mui/icons-material/Refresh";

// ── Search & Filter ───────────────────────────────────────────────────────────
export { default as SearchIcon } from "@mui/icons-material/Search";
export { default as ClearIcon } from "@mui/icons-material/Clear";
export { default as FilterAltOffIcon } from "@mui/icons-material/FilterAltOff";
export { default as TuneOutlinedIcon } from "@mui/icons-material/TuneOutlined";

// ── Status & Feedback ─────────────────────────────────────────────────────────
export { default as CheckIcon } from "@mui/icons-material/Check";
export { default as CheckCircleIcon } from "@mui/icons-material/CheckCircle";
export { default as CheckCircleOutlineIcon } from "@mui/icons-material/CheckCircleOutline";
export { default as CheckCircleRoundedIcon } from "@mui/icons-material/CheckCircleRounded";
export { default as ErrorOutlineIcon } from "@mui/icons-material/ErrorOutline";
export { default as ReplayIcon } from "@mui/icons-material/Replay";
export { default as InboxOutlinedIcon } from "@mui/icons-material/InboxOutlined";
export { default as ConstructionOutlinedIcon } from "@mui/icons-material/ConstructionOutlined";

// ── Visibility & Access ───────────────────────────────────────────────────────
export { default as VisibilityIcon } from "@mui/icons-material/Visibility";
export { default as LockIcon } from "@mui/icons-material/Lock";
export { default as LockOutlinedIcon } from "@mui/icons-material/LockOutlined";
export { default as AdminPanelSettingsOutlinedIcon } from "@mui/icons-material/AdminPanelSettingsOutlined";
export { default as RuleIcon } from "@mui/icons-material/Rule";

// ── Toggle ────────────────────────────────────────────────────────────────────
export { default as ToggleOnIcon } from "@mui/icons-material/ToggleOn";
export { default as ToggleOffIcon } from "@mui/icons-material/ToggleOff";

// ── People / Customer ─────────────────────────────────────────────────────────
export { default as PersonIcon } from "@mui/icons-material/Person";
export { default as PersonOutlineIcon } from "@mui/icons-material/PersonOutline";
export { default as PeopleAltOutlinedIcon } from "@mui/icons-material/PeopleAltOutlined";
export { default as MoreVertIcon } from "@mui/icons-material/MoreVert";
export { default as AccountCircleOutlinedIcon } from "@mui/icons-material/AccountCircleOutlined";

// ── Calendar / Scheduling ─────────────────────────────────────────────────────
export { default as EventIcon } from "@mui/icons-material/Event";
export { default as EventNoteOutlinedIcon } from "@mui/icons-material/EventNoteOutlined";
export { default as EventRepeatIcon } from "@mui/icons-material/EventRepeat";
export { default as CalendarMonthOutlinedIcon } from "@mui/icons-material/CalendarMonthOutlined";
export { default as TodayIcon } from "@mui/icons-material/Today";
export { default as AccessTimeIcon } from "@mui/icons-material/AccessTime";
export { default as AccessTimeOutlinedIcon } from "@mui/icons-material/AccessTimeOutlined";

// ── Domain / Service ──────────────────────────────────────────────────────────
export { default as BathtubIcon } from "@mui/icons-material/Bathtub";
export { default as BathtubOutlinedIcon } from "@mui/icons-material/BathtubOutlined";
export { default as CleaningServicesOutlinedIcon } from "@mui/icons-material/CleaningServicesOutlined";
export { default as PlaceIcon } from "@mui/icons-material/Place";
export { default as PlaceOutlinedIcon } from "@mui/icons-material/PlaceOutlined";
export { default as AddLocationAltOutlinedIcon } from "@mui/icons-material/AddLocationAltOutlined";

// ── Finance / Billing ─────────────────────────────────────────────────────────
export { default as PaymentsOutlinedIcon } from "@mui/icons-material/PaymentsOutlined";
export { default as ReceiptLongOutlinedIcon } from "@mui/icons-material/ReceiptLongOutlined";
export { default as ReceiptLongRoundedIcon } from "@mui/icons-material/ReceiptLongRounded";

// ── Print & Export ────────────────────────────────────────────────────────────
export { default as PrintIcon } from "@mui/icons-material/Print";
export { default as PrintOutlinedIcon } from "@mui/icons-material/PrintOutlined";

// ── Subscriptions / Renewal ───────────────────────────────────────────────────
export { default as AutorenewOutlinedIcon } from "@mui/icons-material/AutorenewOutlined";

// ── Charts / Analytics ────────────────────────────────────────────────────────
export { default as BarChartOutlinedIcon } from "@mui/icons-material/BarChartOutlined";
export { default as TrendingUpIcon } from "@mui/icons-material/TrendingUp";
export { default as InsightsRoundedIcon } from "@mui/icons-material/InsightsRounded";

// ── App / Settings ────────────────────────────────────────────────────────────
export { default as DashboardOutlinedIcon } from "@mui/icons-material/DashboardOutlined";
export { default as SettingsOutlinedIcon } from "@mui/icons-material/SettingsOutlined";
export { default as NotificationsOutlinedIcon } from "@mui/icons-material/NotificationsOutlined";
export { default as LogoutOutlinedIcon } from "@mui/icons-material/LogoutOutlined";

// ── Misc (original marketing-site icons) ─────────────────────────────────────
export { default as ArrowBackIcon } from "@mui/icons-material/ArrowBack";
export { default as ArrowForwardIcon } from "@mui/icons-material/ArrowForward";
export { default as ArrowForwardRoundedIcon } from "@mui/icons-material/ArrowForwardRounded";
export { default as ArrowOutwardIcon } from "@mui/icons-material/ArrowOutward";
export { default as EmailIcon } from "@mui/icons-material/Email";
export { default as LinkedInIcon } from "@mui/icons-material/LinkedIn";
export { default as FormatQuoteIcon } from "@mui/icons-material/FormatQuote";
export { default as FormatQuoteRoundedIcon } from "@mui/icons-material/FormatQuoteRounded";
export { default as StarIcon } from "@mui/icons-material/Star";
export { default as StarBorderIcon } from "@mui/icons-material/StarBorder";
export { default as SchoolIcon } from "@mui/icons-material/School";
export { default as WorkIcon } from "@mui/icons-material/Work";
export { default as AccountBalanceIcon } from "@mui/icons-material/AccountBalance";
export { default as BusinessIcon } from "@mui/icons-material/Business";
export { default as GroupsIcon } from "@mui/icons-material/Groups";
export { default as TrackChangesIcon } from "@mui/icons-material/TrackChanges";
export { default as HandshakeIcon } from "@mui/icons-material/Handshake";
export { default as ShieldIcon } from "@mui/icons-material/Shield";
export { default as IntegrationInstructionsIcon } from "@mui/icons-material/IntegrationInstructions";
export { default as ComputerIcon } from "@mui/icons-material/Computer";
export { default as TranslateIcon } from "@mui/icons-material/Translate";
export { default as MenuBookIcon } from "@mui/icons-material/MenuBook";
export { default as OpenInNewIcon } from "@mui/icons-material/OpenInNew";
export { default as HelpOutlineRoundedIcon } from "@mui/icons-material/HelpOutlineRounded";
export { default as PlaceRoundedIcon } from "@mui/icons-material/PlaceRounded";
export { default as EventAvailableIcon } from "@mui/icons-material/EventAvailable";
export { default as PolicyIcon } from "@mui/icons-material/Policy";
export { default as SettingsSuggestIcon } from "@mui/icons-material/SettingsSuggest";
export { default as SendTimeExtensionIcon } from "@mui/icons-material/SendTimeExtension";
export { default as VerifiedOutlinedIcon } from "@mui/icons-material/VerifiedOutlined";
export { default as PaidOutlinedIcon } from "@mui/icons-material/PaidOutlined";
export { default as RocketLaunchOutlinedIcon } from "@mui/icons-material/RocketLaunchOutlined";
export { default as LaptopOutlinedIcon } from "@mui/icons-material/LaptopOutlined";
export { default as TrendingUpOutlinedIcon } from "@mui/icons-material/TrendingUpOutlined";
export { default as LanguageRoundedIcon } from "@mui/icons-material/LanguageRounded";
export { default as WorkspacePremiumRoundedIcon } from "@mui/icons-material/WorkspacePremiumRounded";
export { default as CodeRoundedIcon } from "@mui/icons-material/CodeRounded";
export { default as MemoryRoundedIcon } from "@mui/icons-material/MemoryRounded";
export { default as SupportAgentRoundedIcon } from "@mui/icons-material/SupportAgentRounded";
export { default as PhoneIcon } from "@mui/icons-material/Phone";
export { default as VerifiedUserIcon } from "@mui/icons-material/VerifiedUser";
export { default as DataObjectIcon } from "@mui/icons-material/DataObject";
export { default as AssuredWorkloadIcon } from "@mui/icons-material/AssuredWorkload";
export { default as CenterFocusStrongIcon } from "@mui/icons-material/CenterFocusStrong";
export { default as AllInclusiveIcon } from "@mui/icons-material/AllInclusive";
export { default as PublicIcon } from "@mui/icons-material/Public";
export { default as LockPersonIcon } from "@mui/icons-material/LockPerson";
export { default as DesignServicesIcon } from "@mui/icons-material/DesignServices";
export { default as SmsIcon } from "@mui/icons-material/Sms";
export { default as PsychologyIcon } from "@mui/icons-material/Psychology";
export { default as SecurityIcon } from "@mui/icons-material/Security";
export { default as Diversity3Icon } from "@mui/icons-material/Diversity3";
export { default as StarRateIcon } from "@mui/icons-material/StarRate";
export { default as VisibilityIconOrig } from "@mui/icons-material/Visibility";

// ─────────────────────────────────────────────────────────────────────────────
// Legacy `Icons` object — retained so existing consumers of theme.Icons.* work.
// New code should use named exports above instead.
// ─────────────────────────────────────────────────────────────────────────────
import ArrowBackIconLegacy from "@mui/icons-material/ArrowBack";
import ArrowForwardIconLegacy from "@mui/icons-material/ArrowForward";
import ArrowForwardRoundedIconLegacy from "@mui/icons-material/ArrowForwardRounded";
import ArrowOutwardIconLegacy from "@mui/icons-material/ArrowOutward";
import EmailIconLegacy from "@mui/icons-material/Email";
import LinkedInIconLegacy from "@mui/icons-material/LinkedIn";
import FormatQuoteIconLegacy from "@mui/icons-material/FormatQuote";
import FormatQuoteRoundedIconLegacy from "@mui/icons-material/FormatQuoteRounded";
import StarIconLegacy from "@mui/icons-material/Star";
import StarBorderIconLegacy from "@mui/icons-material/StarBorder";
import SchoolIconLegacy from "@mui/icons-material/School";
import WorkIconLegacy from "@mui/icons-material/Work";
import AccountBalanceIconLegacy from "@mui/icons-material/AccountBalance";
import BusinessIconLegacy from "@mui/icons-material/Business";
import GroupsIconLegacy from "@mui/icons-material/Groups";
import PersonIconLegacy from "@mui/icons-material/Person";
import VisibilityIconLegacy from "@mui/icons-material/Visibility";
import TrackChangesIconLegacy from "@mui/icons-material/TrackChanges";
import HandshakeIconLegacy from "@mui/icons-material/Handshake";
import ShieldIconLegacy from "@mui/icons-material/Shield";
import TrendingUpIconLegacy from "@mui/icons-material/TrendingUp";
import IntegrationInstructionsIconLegacy from "@mui/icons-material/IntegrationInstructions";
import ComputerIconLegacy from "@mui/icons-material/Computer";
import TranslateIconLegacy from "@mui/icons-material/Translate";
import MenuBookIconLegacy from "@mui/icons-material/MenuBook";
import OpenInNewIconLegacy from "@mui/icons-material/OpenInNew";
import HelpOutlineRoundedIconLegacy from "@mui/icons-material/HelpOutlineRounded";
import PlaceRoundedIconLegacy from "@mui/icons-material/PlaceRounded";
import EventAvailableIconLegacy from "@mui/icons-material/EventAvailable";
import PolicyIconLegacy from "@mui/icons-material/Policy";
import SettingsSuggestIconLegacy from "@mui/icons-material/SettingsSuggest";
import SendTimeExtensionIconLegacy from "@mui/icons-material/SendTimeExtension";
import ExpandMoreIconLegacy from "@mui/icons-material/ExpandMore";
import VerifiedOutlinedIconLegacy from "@mui/icons-material/VerifiedOutlined";
import LockOutlinedIconLegacy from "@mui/icons-material/LockOutlined";
import PaidOutlinedIconLegacy from "@mui/icons-material/PaidOutlined";
import RocketLaunchOutlinedIconLegacy from "@mui/icons-material/RocketLaunchOutlined";
import LaptopOutlinedIconLegacy from "@mui/icons-material/LaptopOutlined";
import TrendingUpOutlinedIconLegacy from "@mui/icons-material/TrendingUpOutlined";
import CheckIconLegacy from "@mui/icons-material/Check";
import LanguageRoundedIconLegacy from "@mui/icons-material/LanguageRounded";
import WorkspacePremiumRoundedIconLegacy from "@mui/icons-material/WorkspacePremiumRounded";
import CheckCircleRoundedIconLegacy from "@mui/icons-material/CheckCircleRounded";
import ReceiptLongRoundedIconLegacy from "@mui/icons-material/ReceiptLongRounded";
import InsightsRoundedIconLegacy from "@mui/icons-material/InsightsRounded";
import CodeRoundedIconLegacy from "@mui/icons-material/CodeRounded";
import MemoryRoundedIconLegacy from "@mui/icons-material/MemoryRounded";
import SupportAgentRoundedIconLegacy from "@mui/icons-material/SupportAgentRounded";
import PhoneIconLegacy from "@mui/icons-material/Phone";
import UserLegacy from "@mui/icons-material/VerifiedUser";
import DataObjectIconLegacy from "@mui/icons-material/DataObject";
import AssuredWorkloadIconLegacy from "@mui/icons-material/AssuredWorkload";
import CenterFocusStrongIconLegacy from "@mui/icons-material/CenterFocusStrong";
import AllInclusiveIconLegacy from "@mui/icons-material/AllInclusive";
import PublicIconLegacy from "@mui/icons-material/Public";
import LockPersonIconLegacy from "@mui/icons-material/LockPerson";
import DesignServicesIconLegacy from "@mui/icons-material/DesignServices";
import SmsIconLegacy from "@mui/icons-material/Sms";
import PsychologyIconLegacy from "@mui/icons-material/Psychology";
import SecurityIconLegacy from "@mui/icons-material/Security";
import Diversity3IconLegacy from "@mui/icons-material/Diversity3";
import StarRateIconLegacy from "@mui/icons-material/StarRate";

export const Icons = {
  arrowback: ArrowBackIconLegacy,
  arrowforward: ArrowForwardRoundedIconLegacy,
  arrowforwardplain: ArrowForwardIconLegacy,
  arrowoutward: ArrowOutwardIconLegacy,
  assuredworkload: AssuredWorkloadIconLegacy,
  allinclusive: AllInclusiveIconLegacy,
  centerfocus: CenterFocusStrongIconLegacy,
  designservice: DesignServicesIconLegacy,
  psychologyicon: PsychologyIconLegacy,
  communication: SmsIconLegacy,
  email: EmailIconLegacy,
  linkedIn: LinkedInIconLegacy,
  visibility: VisibilityIconLegacy,
  quote: FormatQuoteIconLegacy,
  quoterounded: FormatQuoteRoundedIconLegacy,
  star: StarIconLegacy,
  starborder: StarBorderIconLegacy,
  school: SchoolIconLegacy,
  security: SecurityIconLegacy,
  work: WorkIconLegacy,
  accountbalance: AccountBalanceIconLegacy,
  business: BusinessIconLegacy,
  groups: GroupsIconLegacy,
  person: PersonIconLegacy,
  trackchanges: TrackChangesIconLegacy,
  handshake: HandshakeIconLegacy,
  shield: ShieldIconLegacy,
  trendingup: TrendingUpIconLegacy,
  integration: IntegrationInstructionsIconLegacy,
  computer: ComputerIconLegacy,
  translate: TranslateIconLegacy,
  helpoutlinerounded: HelpOutlineRoundedIconLegacy,
  eventavailable: EventAvailableIconLegacy,
  policy: PolicyIconLegacy,
  public: PublicIconLegacy,
  settingssuggest: SettingsSuggestIconLegacy,
  sendtimeextension: SendTimeExtensionIconLegacy,
  expandmore: ExpandMoreIconLegacy,
  verifiedoutlined: VerifiedOutlinedIconLegacy,
  lockoutlined: LockOutlinedIconLegacy,
  lockperson: LockPersonIconLegacy,
  paidoutlined: PaidOutlinedIconLegacy,
  rocketlaunchoutlined: RocketLaunchOutlinedIconLegacy,
  laptopoutlined: LaptopOutlinedIconLegacy,
  trendingupOutlined: TrendingUpOutlinedIconLegacy,
  check: CheckIconLegacy,
  menubook: MenuBookIconLegacy,
  openinnew: OpenInNewIconLegacy,
  place: PlaceRoundedIconLegacy,
  language: LanguageRoundedIconLegacy,
  workspacepremium: WorkspacePremiumRoundedIconLegacy,
  checkcircle: CheckCircleRoundedIconLegacy,
  receiptlong: ReceiptLongRoundedIconLegacy,
  insights: InsightsRoundedIconLegacy,
  code: CodeRoundedIconLegacy,
  memory: MemoryRoundedIconLegacy,
  supportagent: SupportAgentRoundedIconLegacy,
  phone: PhoneIconLegacy,
  call: PhoneIconLegacy,
  user: UserLegacy,
  diversity3: Diversity3IconLegacy,
  dataobject: DataObjectIconLegacy,
  staricon: StarRateIconLegacy,
};

export default Icons;
