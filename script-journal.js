

export function renderLog(role, subject, classes, teacherLastName, map) {
    const mapRecords = {};

    map.grades.forEach(el => {
        if(!mapRecords[el.lastName]) mapRecords[el.lastName] = {};
        mapRecords[el.lastName][el.lessonNumber] = el.rating
    });
    console.log(mapRecords);
};