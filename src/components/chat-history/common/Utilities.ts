export const currentDate = (secondsSinceNow?: number) =>
{
    const currentTime = secondsSinceNow ? new Date(Date.now() - secondsSinceNow * 1000) : new Date();
    return `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
}
