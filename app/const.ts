import cards from '~/src/card'
import ja from './messages/ja/default.json'
import en from './messages/en/default.json'
import type {I18n} from '~/src/index'

export const buttonClassName = "flex items-center justify-center rounded-md border border-transparent" +
  " bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none" +
  " focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-500"

const peerJsErrors: Record<string, I18n> = {
  'browser-incompatible': {
    ja: 'FATAL: ブラウザが対応していません',
    en: "FATAL: The client's browser does not support some or all WebRTC features that you are trying to use.",
  },
  disconnected: {
    ja: 'このIDは既に接続不可状態です。リロードしてやり直して下さい。',
    en: "You've already disconnected this peer from the server and can no longer make any new connections on it.",
  },
  'invalid-id': {
    ja: 'FATAL: IDが存在しません',
    en: 'FATAL: The ID passed into the Peer constructor contains illegal characters.',
  },
  'invalid-key': {
    ja: 'FATAL: APIキーが不正です',
    en: 'FATAL: The API key passed into the Peer constructor contains illegal characters or is not in the system (cloud server only).',
  },
  network: {
    ja: 'オンライン用サーバーが混み合っています。{br}時間を置いてお試し下さい。',
    en: 'Cannot establish a connection to the online(signalling) server.{br}Wait & retry for a while.'
  },
  'peer-unavailable': {
    ja: 'このIDは既に他のhostに所属済みです',
    en: "The peer you're trying to connect to does not exist.(ex, The ID connected already another host.)"
  },
  'ssl-unavailable': {
    ja: 'FATAL: セキュアな通信ができません。他のブラウザでお試し下さい。',
    en: 'PeerJS is being used securely, but the cloud server does not support SSL. Use a custom PeerServer.',
  },
  'server-error': {
    ja: 'FATAL: WebRTCサーバーと接続できません',
    en: 'FATAL: Unable to reach the server.',
  },
  'socket-error': {
    ja: 'FATAL: ソケット上でエラーが発生し、切断しました',
    en: 'FATAL: An error from the underlying socket.',
  },
  'socket-closed': {
    ja: 'FATAL: ソケットがクローズ状態となり、切断しました',
    en: 'FATAL: The underlying socket closed unexpectedly.',
  },
  'unavailable-id': {
    ja: 'あなたのIDは現在使用できません。リロードしてやり直してください。',
    en: 'The ID passed into the Peer constructor is already taken.',
  },
  webrtc: {
    ja: 'WebRTC固有のエラーが発生しました。',
    en: 'Native WebRTC errors.'
  },
}

export const defaultLng: I18nStr = 'en'
export type I18nStr = keyof I18n
const i18n: Record<I18nStr, Record<string, string>> = {
  en: {
    "duplex_player_id": "There are players with the same ID",
    "not_available_card": "This card cannot be used.",
    "require_at_least_1_dice": "Requires at least one die fix",
    "invalid_data": "Invalid data selected",
    "invalid_player_number": "Set only 2 to 5 players.",

    "non_host_connection_close": "Disconnected with host. Share your ID to Another host.",
    "host_connection_close": "This ID is already connected with you or another host",
    "peer_id_title": "ID is within {len} (letters including '-','_' & ' ')",
    "online_name": "Name is within 10 letters",
    "online_id": "Share this ID to your host.{br}(Only host can change order and start)",
    "order": "Play from top to bottom on Round 1.(You can move them by dragging and dropping)",
    "online": "・This is beta.{br}・No auto matching. Please share your ID to host by yourself.{br}・Not crack down on Glitch/Delay.{br}・If disconnected, may become offline mode.",

    "ability": "ability",
    "cost": "cost",
    "remaining": "remaining",
    "status": "Status page of Online mode (WebRTC server)",
    "fix": "Fix one or more dice.{br}Repeat ituntil all dice are confirmed to get a card.",
    "choose_no_card": "No card is selected, are you sure?",
    "error.title": "Something went wrong!",
    "error.report": "Please report it(only 10 seconds)",
    ...en,
    ...Object.keys(peerJsErrors).reduce((a, v) => ({...a, [v]: peerJsErrors[v].en}), {}),
  },
  ja: {
    "duplex_player_id": "同じIDのプレイヤーがいます",
    "not_available_card": "使用不可のカードです",
    "require_at_least_1_dice": "最低一つのダイスfixが必要",
    "invalid_data": "不正なデータ選択です",
    "invalid_player_number": "2〜5人で遊べます",

    "non_host_connection_close": "ホストとの接続が切断されました",
    "host_connection_close": "既に（他の）ホストと通信済みのIDです",
    "peer_id_title": "IDは{len}文字の英数字およびハイフン、アンダースコア、スペースからなる文字列です",
    "online_name": "1~10文字で命名ください",
    "online_id": "ホストにIDを共有して下さい。{br}(順番や開始の操作はホストのみ行えます)",
    "order": "Round 1は上から順に行います。ドラッグ&ドロップで移動できます。",
    "online": "・オンライン機能は改善中です{br}・マッチング機能は現在ありません。発行されたIDを自身でホストにシェアください{br}・不正・遅延の対策機能はありません{br}・接続切れ端末は一人回しモードに移行することがあります",

    "ability": "能力",
    "cost": "条件",
    "remaining": "残数",
    "status": "オンライン通信(WebRTC)サーバーのステータス",
    "fix": "1つ以上のダイスを確定(Fixed)しましょう。{br}カードを使って出目操作やダイスの追加もできます。{br}全てのダイスが確定するまで繰り返し、カードを取得します。",
    "choose_no_card": "カードが選択されていませんがよろしいですか？",
    "error.title": "問題が発生しました",
    "error.report": "以下'Error message'をコピペいただき、レポートお願いします(10秒程度)",
    ...ja,
    ...Object.keys(peerJsErrors).reduce((a, v) => ({...a, [v]: peerJsErrors[v].ja}), {}),
  },
}

for (const lng of Object.keys(i18n) as I18nStr[]) {
  for (const name of Object.keys(cards)) {
    i18n[lng][`${name}`] = cards[name].name[lng]
    i18n[lng][`${name}.cost`] = cards[name].cost.description[lng]
    i18n[lng][`${name}.ability`] = cards[name].ability.description[lng]
  }
}

export default i18n