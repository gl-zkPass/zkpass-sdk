/*
 * monitorResources.component.tsx
 *
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: January 18th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   NONE
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
"use client";
import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { format, getWeekOfMonth, subDays } from "date-fns";
import { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Card,
  CardBody,
} from "@nextui-org/react";
import { FaArrowRight, FaCopy, FaFilter, FaSearch } from "react-icons/fa";
import {
  AggregateCount,
  ApiUsageType,
  CalendarInterval,
} from "@/backend/resources/constants/ResourceConstants";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Tooltip } from "@nextui-org/react";
import { totalRowsToPage } from "@lib/clientHelper";
import { FilterApiUsagePayload } from "@/backend/resources/interfaces/ResourcesInterfaces";
import { toast } from "react-toastify";

export default function MonitorResourcesComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [apiUsageSeries, setApiUsageSeries] = useState<ApexAxisChartSeries>([]);
  const [apiUsageOption, setApiUsageOption] = useState<ApexCharts.ApexOptions>(
    {}
  );

  const [apiKeyFilter, setApiKeyFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState(
    subDays(new Date(), 7)
  );
  const [endDateFilter, setEndDateFilter] = useState(new Date());
  const [timeIntervalFilter, setTimeIntervalFilter] = useState(
    CalendarInterval.Hourly
  );

  const [apiUsageData, setApiUsageData] = useState<ApiUsageType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isFetchLoading, setIsFetchLoading] = useState(true);

  const fethApiUsage = async () => {
    setIsFetchLoading(true);
    try {
      const endpoint = "/api/resources/api_usage";
      const filterPayload: FilterApiUsagePayload = {
        start_index: currentPage,
        api_key: apiKeyFilter,
        start_date: startDateFilter.toISOString(),
        end_date: endDateFilter.toISOString(),
        interval: timeIntervalFilter,
      };
      const response = await fetch(endpoint, {
        body: JSON.stringify(filterPayload),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseJson = await response.json();

      if (response.status == 400) {
        toast.error(responseJson.error);
        setIsFetchLoading(false);
        return;
      }

      const totalApi: number = responseJson.data.totalApi;
      const apiUsageAggregate: AggregateCount[] =
        responseJson.data.apiUsageAggregate;
      const apiUsage: ApiUsageType[] = responseJson.data.apiUsage;

      if (apiUsageAggregate.length > 0) {
        const labelStyle = {
          labels: {
            style: {
              colors: "gray",
            },
          },
        };
        setApiUsageOption({
          grid: {
            show: true,
          },
          xaxis: {
            categories: apiUsageAggregate.map((item: AggregateCount) =>
              formatDateLabel(item.key_as_string)
            ),
            labels: {
              ...labelStyle.labels,
            },
          },
          yaxis: {
            ...labelStyle,
          },
        });
        setApiUsageSeries([
          {
            name: "Hits",
            data: apiUsageAggregate.map(
              (item: AggregateCount) => item.doc_count
            ),
          },
        ]);
      } else {
        setApiUsageOption({
          grid: {
            show: false,
          },
          xaxis: {
            categories: [],
          },
          yaxis: {
            labels: {
              formatter: () => {
                return "";
              },
            },
          },
          noData: {
            text: "Api Key Usage not Found",
            style: {
              color: "gray",
              fontSize: "18px",
              fontFamily: undefined,
            },
          },
        });
        setApiUsageSeries([]);
      }

      setTotalPage(totalRowsToPage(totalApi));
      setApiUsageData(apiUsage);
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong!");
    }
    setIsFetchLoading(false);
  };

  useEffect(() => {
    fethApiUsage();
  }, [currentPage]);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return format(date, "dd MMM yyyy HH:mm:ss");
  };
  const formatDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr);

    switch (timeIntervalFilter) {
      case CalendarInterval.Hourly:
        return format(date, "dd MMM yyyy HH:mm");
      case CalendarInterval.Daily:
        return format(date, "dd MMM yyyy");
      case CalendarInterval.Weekly:
        return "Week " + getWeekOfMonth(date) + format(date, " 'of' MMM yyyy");
      case CalendarInterval.Monthly:
        return format(date, "MMMM yyyy");
      case CalendarInterval.Yearly:
        return format(date, "yyyy");
      default:
        return format(date, "dd MMM yyyy HH:mm");
    }
  };

  const formatTimeInterval = (interval: CalendarInterval): string => {
    let intervalString = "";
    switch (interval) {
      case CalendarInterval.Hourly:
        intervalString = "Hourly";
        break;
      case CalendarInterval.Daily:
        intervalString = "Daily";
        break;
      case CalendarInterval.Weekly:
        intervalString = "Weekly";
        break;
      case CalendarInterval.Monthly:
        intervalString = "Monthly";
        break;
      case CalendarInterval.Yearly:
        intervalString = "Yearly";
        break;
      default:
        intervalString = "Hourly";
        break;
    }
    return intervalString;
  };

  const onCopyFeature = async (text_to_copy: string) => {
    try {
      await navigator.clipboard.writeText(text_to_copy);
      toast.success("Success copied text!");
    } catch (err) {
      toast.error(`Failed to copy text: ${err}`);
    }
  };

  return (
    <>
      <div className='w-5/6 flex flex-col gap-4'>
        <h1 className='mt-3 text-2xl font-extrabold tracking-tight text-slate-100'>
          API Key Usage
        </h1>
        <div className='flex flex-row gap-2'>
          <Input
            size='sm'
            className='h-full w-[30%]'
            placeholder='Filter by api key'
            onChange={(e) => setApiKeyFilter(e.target.value)}
            startContent={<FaSearch />}
          />

          <Card className='w-[30%] overflow-visible'>
            <CardBody className='overflow-visible'>
              <div className='flex flex-row w-full gap-1 items-center justify-between'>
                <Tooltip content='Start Date'>
                  <div className='flex flex-row justify-center w-[45%]'>
                    <DatePicker
                      className='border rounded w-full border-gray-600 text-center'
                      showTimeSelect
                      dateFormat='dd MMM yyyy HH:mm'
                      selected={startDateFilter}
                      onChange={(date: any) => setStartDateFilter(date)}
                    />
                  </div>
                </Tooltip>
                <div className='flex flex-row w-[10%] justify-center'>
                  <FaArrowRight />
                </div>
                <Tooltip content='End Date'>
                  <div className='flex flex-row justify-center w-[45%]'>
                    <DatePicker
                      className='border rounded w-full border-gray-600 text-center'
                      showTimeSelect
                      dateFormat='dd MMM yyyy HH:mm'
                      selected={endDateFilter}
                      onChange={(date: any) => setEndDateFilter(date)}
                    />
                  </div>
                </Tooltip>
              </div>
            </CardBody>
          </Card>

          <Dropdown className='w-[10%]'>
            <DropdownTrigger>
              <Button
                className='h-12 w-64'
                startContent={
                  <>
                    <FaFilter /> Interval :{" "}
                  </>
                }
                variant='flat'
                color='primary'
              >
                {formatTimeInterval(timeIntervalFilter)}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label='Filter Status'>
              <DropdownItem
                key='hourly'
                onClick={() => setTimeIntervalFilter(CalendarInterval.Hourly)}
              >
                Hourly
              </DropdownItem>
              <DropdownItem
                key='daily'
                onClick={() => setTimeIntervalFilter(CalendarInterval.Daily)}
              >
                Daily
              </DropdownItem>
              <DropdownItem
                key='weekly'
                onClick={() => setTimeIntervalFilter(CalendarInterval.Weekly)}
              >
                Weekly
              </DropdownItem>
              <DropdownItem
                key='monthly'
                onClick={() => setTimeIntervalFilter(CalendarInterval.Monthly)}
              >
                Monthly
              </DropdownItem>
              <DropdownItem
                key='yearly'
                onClick={() => setTimeIntervalFilter(CalendarInterval.Yearly)}
              >
                Yearly
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Button
            isLoading={isFetchLoading}
            className='h-12'
            color='primary'
            onClick={() => {
              setCurrentPage(1);
              fethApiUsage();
            }}
          >
            {isFetchLoading ? "Loading.." : "Filter"}
          </Button>
        </div>

        <Card className='text-black pt-5'>
          <ApexChart
            type='bar'
            options={apiUsageOption}
            series={apiUsageSeries}
            width={"100%"}
            height={300}
          />
        </Card>

        <div className='flex flex-row justify-between gap-4'>
          <div className='flex flex-row items-center justify-start gap-3 w-5/6'></div>
        </div>

        <Table
          aria-label='Example table with custom cells'
          bottomContent={
            !isFetchLoading &&
            apiUsageData.length > 0 && (
              <div className='w-full flex flex-row justify-center'>
                <Pagination
                  showControls
                  total={totalPage}
                  page={currentPage}
                  onChange={(page) => {
                    setCurrentPage(page);
                  }}
                />
              </div>
            )
          }
        >
          <TableHeader>
            <TableColumn key='timestamp' align='start'>
              Timestamp
            </TableColumn>
            <TableColumn key='api-key' align='start'>
              API Key
            </TableColumn>
            <TableColumn key='business-email' align='start'>
              Business Email
            </TableColumn>
            <TableColumn key='endpoint-name' align='center'>
              Endpoint
            </TableColumn>
            <TableColumn key='latency' align='start'>
              Latency (ms)
            </TableColumn>
          </TableHeader>

          <TableBody
            items={apiUsageData}
            emptyContent={!isFetchLoading && "API Key Usage not found."}
            isLoading={isFetchLoading}
            loadingContent={<Spinner />}
          >
            {(item) => (
              <TableRow key={item.id ?? ""}>
                <TableCell>
                  <p>{formatDate(item.timestamp ?? "")}</p>
                </TableCell>
                <TableCell>
                  <span className='flex flex-row justify-between'>
                    <p>{item.api_key ?? ""}</p>
                    <Tooltip content='Copy Api Key'>
                      <span
                        className='cursor-pointer pe-2'
                        onClick={() => onCopyFeature(item.api_key)}
                      >
                        <FaCopy />
                      </span>
                    </Tooltip>
                  </span>
                </TableCell>
                <TableCell>
                  <p>{item.email ?? ""}</p>
                </TableCell>
                <TableCell>
                  <p>{item.endpoint ?? ""}</p>
                </TableCell>
                <TableCell>
                  <p>{item.latency ?? ""}</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
