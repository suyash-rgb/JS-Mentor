import { useProgressContext } from '../context/ProgressContext';
import { useCurriculum } from './useCurriculum';

export const useProgress = () => {
    const { theoryProgress, exerciseProgress, markTheoryRead, submitExerciseResult } = useProgressContext();
    const { curriculum } = useCurriculum();

    /**
     * computePageProgress
     * Calculates the progress for a specific page (URL)
     * Factors in:
     * 1. Theory Read (Binary)
     * 2. Exercise Completion (Percentage)
     */
    const computePageProgress = (pageUrl) => {
        if (!curriculum) return { percentage: 0, status: 'Locked' };

        // Find the page content in the curriculum
        let targetPage = null;
        for (const card of curriculum.cards) {
            const link = card.links.find(l => l.url === `/${pageUrl}` || l.url === pageUrl);
            if (link) {
                targetPage = link.pageContent;
                break;
            }
        }

        if (!targetPage) return { percentage: 0, status: 'Locked' };

        const isTheoryRead = theoryProgress[pageUrl] || false;
        const exercises = targetPage.exercises || [];
        const totalExercises = exercises.length;

        if (totalExercises === 0) {
            // No exercises: 100% based on theory read
            return {
                percentage: isTheoryRead ? 100 : 0,
                status: isTheoryRead ? 'Completed' : 'In Progress'
            };
        }

        // With exercises: 50% theory, 50% exercises mastery
        const completedExercises = exercises.filter(ex => 
            exerciseProgress[ex.id]?.status === 'completed'
        ).length;

        const exercisePercentage = (completedExercises / totalExercises) * 100;
        const theoryWeight = 0.3; // 30% for reading
        const exerciseWeight = 0.7; // 70% for exercises (mastery matters more)

        const totalPercentage = (isTheoryRead ? theoryWeight * 100 : 0) + (exercisePercentage * exerciseWeight);

        return {
            percentage: Math.round(totalPercentage),
            status: totalPercentage === 100 ? 'Completed' : (totalPercentage > 0 ? 'In Progress' : 'Locked')
        };
    };

    /**
     * computeHeadingProgress
     * Calculates the aggregate progress for a whole card/heading (e.g., Fundamentals)
     */
    const computeHeadingProgress = (headingName) => {
        if (!curriculum) return 0;
        
        const card = curriculum.cards.find(c => c.heading === headingName);
        if (!card) return 0;

        const pageProgresses = card.links.map(link => computePageProgress(link.url));
        const totalPercentage = pageProgresses.reduce((sum, p) => sum + p.percentage, 0);
        
        return Math.round(totalPercentage / card.links.length);
    };

    return {
        theoryProgress,
        exerciseProgress,
        markTheoryRead,
        submitExerciseResult,
        computePageProgress,
        computeHeadingProgress
    };
};
