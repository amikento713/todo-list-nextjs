"use client";

import { ReactNode } from "react";

import OverviewChart from "../Chart/OverviewChart";
import { TaskOverviewMetrics } from "../../lib/taskAnalytics";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  metrics: TaskOverviewMetrics;
  sidebarExtra?: ReactNode;
  children: ReactNode;
}

export default function DashboardLayout({
  metrics,
  sidebarExtra,
  children,
}: DashboardLayoutProps) {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label="Task overview sidebar">
        <section className={styles.overviewCard}>
          <h2 className={styles.overviewTitle}>Task Overview</h2>

          <div className={styles.metricsGrid}>
            <div className={`${styles.metricCard} ${styles.metricActive}`}>
              <div className={styles.metricContent}>
                <div className={styles.metricLabel}>Active</div>
                <div className={styles.metricValue}>{metrics.active}</div>
              </div>
              <span className={styles.metricSwatch} aria-hidden="true" />
            </div>

            <div className={`${styles.metricCard} ${styles.metricDueSoon}`}>
              <div className={styles.metricContent}>
                <div className={styles.metricLabel}>Due Soon</div>
                <div className={styles.metricValue}>{metrics.dueSoon}</div>
              </div>
              <span className={styles.metricSwatch} aria-hidden="true" />
            </div>

            <div className={`${styles.metricCard} ${styles.metricCompleted}`}>
              <div className={styles.metricContent}>
                <div className={styles.metricLabel}>Completed</div>
                <div className={styles.metricValue}>{metrics.completed}</div>
              </div>
              <span className={styles.metricSwatch} aria-hidden="true" />
            </div>
          </div>

          <OverviewChart metrics={metrics} />
          {sidebarExtra}
        </section>
      </aside>

      <div className={styles.main}>
        <section className={styles.mainCard}>{children}</section>
      </div>
    </div>
  );
}
