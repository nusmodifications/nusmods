import { fetchModules } from './api';

export const getRandomCourse = async () => {
  const courses = await fetchModules();
  if (!courses || courses.length === 0) {
    console.log('No courses available');
    return null;
  }
  const randomIndex = Math.floor(Math.random() * courses.length);
  const randomCourse = courses[randomIndex];
  console.log('Random Course:', randomCourse);
  return randomCourse;
};
