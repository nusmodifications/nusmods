
import React, { useState } from 'react'
import classnames from 'classnames';
import { ChevronDown, ChevronUp } from 'react-feather';
import styles from './OptimiserFAQ.scss';

export default function FAQComponent({question, body}: {question: string, body: React.ReactNode}) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <div className={styles.descriptionSection}>
            <div className={classnames('accordion', styles.accordion)} id="optimiserDescriptionAccordion">
                <div className="card">
                    <div
                        className={classnames('card-header', styles.cardHeader)}
                        id="optimiserAccordionHeading"
                    >
                        <button
                            className={classnames('btn btn-link', styles.toggleButton, {
                                [styles.collapsed]: !isOpen,
                            })}
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls="optimiserAccordionBody"
                            onClick={() => setIsOpen((prev) => !prev)}
                        >
                            <span className={styles.titleText}>{question}</span>
                            <span className={styles.toggleIcon}>{isOpen ? <ChevronUp /> : <ChevronDown />}</span>
                        </button>
                    </div>
                    <div
                        id="optimiserAccordionBody"
                        className={classnames('collapse', styles.collapse, {
                            [styles.open]: isOpen,
                        })}
                        aria-labelledby="optimiserAccordionHeading"
                        data-parent="#optimiserDescriptionAccordion"
                    >
                        <div className={classnames('card-body', styles.cardBody)}>
                            <div className={styles.bodyContent}>
                                {body}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}