import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useLogsStore } from '../stores/logsStore';
import { WeightMetric } from './dashboard/WeightMetric';
import { CaloriesMetric } from './dashboard/CaloriesMetric';
import { StepsMetric } from './dashboard/StepsMetric';
import { DateRangeSelector } from './dashboard/DateRangeSelector';
import { QuickLogWidget } from './QuickLogWidget';
import { calculateDateRange, updateDateRangeWithLogs, isDateInRange } from '../utils/dateRangeCalculations';
import { Activity, Scale, Utensils } from 'lucide-react';

type DateRangeType = 'week' | 'month';

export function Dashboard() {
  const { user } = useAuthStore();
  const { profile } = useUserStore();
  const { logs, fetchLogs } = useLogsStore();
  const [dateRange, setDateRange] = useState<DateRangeType>('week');
  const [dateRangeInfo, setDateRangeInfo] = useState(calculateDateRange('week'));

  const refreshLogs = async () => {
    if (user?.uid) {
      await fetchLogs(user.uid);
    }
  };

  useEffect(() => {
    refreshLogs();
  }, [user?.uid]);

  useEffect(() => {
    const newDateRange = calculateDateRange(dateRange);
    const updatedDateRange = updateDateRangeWithLogs(newDateRange, logs);
    setDateRangeInfo(updatedDateRange);
  }, [dateRange, logs]);

  if (!profile || !logs) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return isDateInRange(logDate, dateRangeInfo.startDate, dateRangeInfo.endDate);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <DateRangeSelector
        dateRange={dateRange}
        onChange={setDateRange}
        startDate={dateRangeInfo.startDate}
        endDate={dateRangeInfo.endDate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WeightMetric
          currentWeight={profile.currentWeight}
          targetWeight={profile.targetWeight}
          logs={filteredLogs}
          dateRange={dateRange}
        />

        <CaloriesMetric
          logs={filteredLogs}
          dailyTarget={profile.dailyCaloriesTarget}
          dateRange={dateRange}
          dateRangeInfo={dateRangeInfo}
        />

        <StepsMetric
          logs={filteredLogs}
          dailyTarget={profile.dailyStepsGoal}
          dateRange={dateRange}
          dateRangeInfo={dateRangeInfo}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickLogWidget
          icon={Scale}
          label="Log Weight"
          unit="kg"
          step={0.1}
          min={30}
          max={300}
          defaultValue={profile.currentWeight}
          field="weight"
          onLogAdded={refreshLogs}
        />
        <QuickLogWidget
          icon={Utensils}
          label="Log Calories"
          unit="kcal"
          step={50}
          min={0}
          max={10000}
          defaultValue={profile.dailyCaloriesTarget}
          field="calories"
          onLogAdded={refreshLogs}
        />
        <QuickLogWidget
          icon={Activity}
          label="Log Steps"
          unit="steps"
          step={100}
          min={0}
          max={100000}
          defaultValue={profile.dailyStepsGoal}
          field="steps"
          onLogAdded={refreshLogs}
        />
      </div>
    </div>
  );
}