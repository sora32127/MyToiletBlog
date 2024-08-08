export default function DateTime({ unixtime }: { unixtime: number }) {
    // UNIXTIMEはUTCで確定なので日本時間に変換する
    // 9時間進める
    const date = new Date((unixtime) * 1000)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()

    // YYYY-MM-DD HH:MM の形式で返す パディングを実施する
    const monthStr = month.toString().padStart(2, '0')
    const dayStr = day.toString().padStart(2, '0')
    const hourStr = hour.toString().padStart(2, '0')
    const minuteStr = minute.toString().padStart(2, '0')
    const localDateString = `${year}-${monthStr}-${dayStr} ${hourStr}:${minuteStr}`
    return (
        <div className="text-sm">
            {localDateString}
        </div>
    )
}

