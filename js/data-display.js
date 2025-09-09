export function displayUserData(userData) {
    if (!userData || !userData.classOrsubject || !userData.data) {
        console.error("Помилка: Неповні дані користувача.");
        return;
    }

    const { role, classOrsubject, data } = userData;

    console.log(`-- Дані користувача (${role}) --`);
    console.log("classOrsubject:", classOrsubject);
    console.log("data:", data);
    console.log("----------------------------");
}