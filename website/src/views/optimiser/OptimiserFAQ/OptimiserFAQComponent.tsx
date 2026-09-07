import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/ui/accordion';
import styles from './OptimiserFAQ.scss';

export default function FAQComponent({
  question,
  body,
}: {
  question: string;
  body: React.ReactNode;
}) {
  return (
    <Accordion type="single" collapsible className={styles.descriptionSection}>
      <AccordionItem value="answer" className={styles.accordion}>
        <AccordionTrigger className={styles.toggleButton}>
          <span className={styles.titleText}>{question}</span>
        </AccordionTrigger>
        <AccordionContent className={styles.cardBody}>
          <div className={styles.bodyContent}>{body}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
