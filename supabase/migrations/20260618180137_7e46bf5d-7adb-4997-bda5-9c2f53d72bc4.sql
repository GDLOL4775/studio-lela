UPDATE public.weekly_schedule SET start_time = '13:00:00', end_time = '17:00:00', active = true WHERE weekday = 1;
UPDATE public.weekly_schedule SET start_time = '13:00:00', end_time = '17:30:00', active = true WHERE weekday = 2;
UPDATE public.weekly_schedule SET start_time = '13:00:00', end_time = '17:30:00', active = true WHERE weekday = 3;
UPDATE public.weekly_schedule SET start_time = '13:00:00', end_time = '17:00:00', active = true WHERE weekday = 4;
UPDATE public.weekly_schedule SET start_time = '13:00:00', end_time = '17:30:00', active = true WHERE weekday = 5;
UPDATE public.weekly_schedule SET start_time = '10:00:00', end_time = '17:30:00', active = true WHERE weekday = 6;
UPDATE public.weekly_schedule SET active = false WHERE weekday = 0;