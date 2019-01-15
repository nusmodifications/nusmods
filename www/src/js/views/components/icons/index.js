// @flow

import React from 'react';

// Refer to https://feathericons.com/ for full list.
import AlertTriangleIcon from 'react-feather/dist/icons/alert-triangle';
import ArchiveIcon from 'react-feather/dist/icons/archive';
import BookOpenIcon from 'react-feather/dist/icons/book-open';
import CalendarIcon from 'react-feather/dist/icons/calendar';
import ChevronLeftIcon from 'react-feather/dist/icons/chevron-left';
import ChevronRightIcon from 'react-feather/dist/icons/chevron-right';
import ChevronDownIcon from 'react-feather/dist/icons/chevron-down';
import CloseIcon from 'react-feather/dist/icons/x';
import ClockIcon from 'react-feather/dist/icons/clock';
import CopyIcon from 'react-feather/dist/icons/copy';
import DollarSignIcon from 'react-feather/dist/icons/dollar-sign';
import DownloadIcon from 'react-feather/dist/icons/download';
import EyeIcon from 'react-feather/dist/icons/eye';
import EyeOffIcon from 'react-feather/dist/icons/eye-off';
import FacebookIcon from 'react-feather/dist/icons/facebook';
import FileTextIcon from 'react-feather/dist/icons/file-text';
import FilterIcon from 'react-feather/dist/icons/filter';
import GitHubIcon from 'react-feather/dist/icons/github';
import GridIcon from 'react-feather/dist/icons/grid';
import HeartIcon from 'react-feather/dist/icons/heart';
import HelpIcon from 'react-feather/dist/icons/help-circle';
import ImageIcon from 'react-feather/dist/icons/image';
import LayersIcon from 'react-feather/dist/icons/layers';
import LinkedInIcon from 'react-feather/dist/icons/linkedin';
import MapIcon from 'react-feather/dist/icons/map';
import MapPinIcon from 'react-feather/dist/icons/map-pin';
import MenuIcon from 'react-feather/dist/icons/menu';
import MessageSquareIcon from 'react-feather/dist/icons/message-square';
import MailIcon from 'react-feather/dist/icons/mail';
import MaximizeIcon from 'react-feather/dist/icons/maximize-2';
import MinimizeIcon from 'react-feather/dist/icons/minimize-2';
import MinusIcon from 'react-feather/dist/icons/minus';
import MinusSquareIcon from 'react-feather/dist/icons/minus-square';
import PlusSquareIcon from 'react-feather/dist/icons/plus-square';
import PlusIcon from 'react-feather/dist/icons/plus';
import RefreshIcon from 'react-feather/dist/icons/refresh-cw';
import RepeatIcon from 'react-feather/dist/icons/repeat';
import SettingsIcon from 'react-feather/dist/icons/settings';
import SearchIcon from 'react-feather/dist/icons/search';
import SidebarIcon from 'react-feather/dist/icons/sidebar';
import StarIcon from 'react-feather/dist/icons/star';
import ThumbsUpIcon from 'react-feather/dist/icons/thumbs-up';
import TrelloIcon from 'react-feather/dist/icons/trello';
import TwitterIcon from 'react-feather/dist/icons/twitter';
import TrashIcon from 'react-feather/dist/icons/trash-2';
import TypeIcon from 'react-feather/dist/icons/type';
import ZapIcon from 'react-feather/dist/icons/zap';

//
type Props = {|
  // These props are explicitly supported by React Feather
  size?: number,
  color?: string,

  // And the rest are just spread onto the <svg> element
  [key: string]: any,
|};

// Memoize icon elements to stop them from re-rendering when their parent component
// is re-rendered, since their props rarely change
export const Archive = React.memo<Props>(ArchiveIcon);
export const AlertTriangle = React.memo<Props>(AlertTriangleIcon);
export const BookOpen = React.memo<Props>(BookOpenIcon);
export const Calendar = React.memo<Props>(CalendarIcon);
export const ChevronLeft = React.memo<Props>(ChevronLeftIcon);
export const ChevronRight = React.memo<Props>(ChevronRightIcon);
export const ChevronDown = React.memo<Props>(ChevronDownIcon);
export const Close = React.memo<Props>(CloseIcon);
export const Clock = React.memo<Props>(ClockIcon);
export const Copy = React.memo<Props>(CopyIcon);
export const DollarSign = React.memo<Props>(DollarSignIcon);
export const Download = React.memo<Props>(DownloadIcon);
export const Eye = React.memo<Props>(EyeIcon);
export const EyeOff = React.memo<Props>(EyeOffIcon);
export const Facebook = React.memo<Props>(FacebookIcon);
export const Filter = React.memo<Props>(FilterIcon);
export const FileText = React.memo<Props>(FileTextIcon);
export const GitHub = React.memo<Props>(GitHubIcon);
export const Grid = React.memo<Props>(GridIcon);
export const Heart = React.memo<Props>(HeartIcon);
export const Help = React.memo<Props>(HelpIcon);
export const Image = React.memo<Props>(ImageIcon);
export const Layers = React.memo<Props>(LayersIcon);
export const Map = React.memo<Props>(MapIcon);
export const Maximize = React.memo<Props>(MaximizeIcon);
export const Minus = React.memo<Props>(MinusIcon);
export const Minimize = React.memo<Props>(MinimizeIcon);
export const MapPin = React.memo<Props>(MapPinIcon);
export const Menu = React.memo<Props>(MenuIcon);
export const MessageSquare = React.memo<Props>(MessageSquareIcon);
export const Mail = React.memo<Props>(MailIcon);
export const LinkedIn = React.memo<Props>(LinkedInIcon);
export const Refresh = React.memo<Props>(RefreshIcon);
export const Repeat = React.memo<Props>(RepeatIcon);
export const MinusSquare = React.memo<Props>(MinusSquareIcon);
export const PlusSquare = React.memo<Props>(PlusSquareIcon);
export const Plus = React.memo<Props>(PlusIcon);
export const Search = React.memo<Props>(SearchIcon);
export const Settings = React.memo<Props>(SettingsIcon);
export const Sidebar = React.memo<Props>(SidebarIcon);
export const Star = React.memo<Props>(StarIcon);
export const ThumbsUp = React.memo<Props>(ThumbsUpIcon);
export const Trello = React.memo<Props>(TrelloIcon);
export const Twitter = React.memo<Props>(TwitterIcon);
export const Trash = React.memo<Props>(TrashIcon);
export const Type = React.memo<Props>(TypeIcon);
export const Zap = React.memo<Props>(ZapIcon);
