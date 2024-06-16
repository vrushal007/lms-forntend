import * as yup from "yup";
import PropTypes from "prop-types";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFieldArray, useForm } from "react-hook-form";

import { Add } from "@mui/icons-material";
// components
import { LoadingButton } from "@mui/lab";
// @mui
import {
  Box,
  Chip,
  Stack,
  Drawer,
  Button,
  Divider,
  TextField,
  Container,
  Typography,
  IconButton,
  Autocomplete,
  FormHelperText,
  CircularProgress,
} from "@mui/material";

import { useResponsive } from "src/hooks/use-responsive";

import {
  useCreateCourseMutation,
  useEditCourseMutation,
  useGetCourseByUserQuery,
} from "src/redux/services/courseApi";

import Iconify from "src/components/iconify";
import Scrollbar from "src/components/scrollbar";

CourseForm.propTypes = {
  open: PropTypes.bool,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  edit: PropTypes.bool,
  openRow: PropTypes.object,
};

export default function CourseForm({ open, onClose, edit, openRow }) {
  const { enqueueSnackbar } = useSnackbar();
  console.log(openRow, edit);
  const isMedium = useResponsive("down", "md");

  const CourseSchema = yup.object().shape({
    title: yup.string().required("Title is required"),
    description: yup.string().required("Description is required"),
    category: yup
      .array()
      .of(yup.string())
      .min(1, "Tags is required")
      .typeError("Tags is required"),
    lectureLinks: yup
      .array()
      .of(
        yup.object().shape({
          label: yup.string().required("Label is required"),
          link: yup.string().required("Link is required"),
        }),
      )
      .min(1, "Course Links is required")
      .typeError("Course Links is required"),
    price: yup.number().required("Price is required"),
    instructorName: yup.string().required("Instructor is required"),
    totalDuration: yup.string().required("Total Duration is required"),
    thumbnail: yup.string().required("Thumbnail is required"),
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm({
    resolver: yupResolver(CourseSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lectureLinks",
  });

  useEffect(() => {
    if (fields.length === 0) {
      append("");
    }
  }, [open]);

  const addCourseLinkHandler = () => {
    if (!Object.keys(errors).length) {
      append("");
    }
  };

  const deleteCourseLinkHandler = (index) => {
    if (fields.length === 1) return;
    remove(index);
  };

  const [createBlog, { isLoading }] = useCreateCourseMutation();
  const [editBlog, { isLoading: isEditLoading }] = useEditCourseMutation();

  useEffect(() => {
    if (edit && openRow) {
      setValue("title", openRow?.title);
      setValue("description", openRow?.description);
      setValue("category", openRow?.category);
      setValue("lectureLinks", openRow?.lectureLinks);
      setValue("price", openRow?.price);
      setValue("instructorName", openRow?.instructorName);
      setValue("totalDuration", openRow?.totalDuration);
      setValue("thumbnail", openRow?.thumbnail);
    } else {
      reset();
      fields.forEach((item, index) => {
        remove(index);
      });
    }
  }, [open, reset, openRow, edit, setValue]);

  const handleClick = async (values) => {
    try {
      let resultAction;
      if (edit) {
        resultAction = await editBlog({
          ...values,
          id: openRow?.id,
        });
      } else {
        resultAction = await createBlog({
          ...values,
        });
      }
      if (resultAction?.data?.success) {
        enqueueSnackbar(resultAction?.data?.message, { variant: "success" });
        reset();
        onClose();
      }
    } catch (err) {
      enqueueSnackbar(err?.error, { variant: "error" });
      console.error("Failed to create devices: ", err);
    }
  };

  console.log("errors", errors);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMedium ? "100%" : "80%",
          border: "none",
          overflow: "hidden",
          maxWidth: 500,
        },
      }}
    >
      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3 }}>
          <div>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                {edit ? "Edit" : "Create"} Blog
              </Typography>
              <IconButton onClick={onClose}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Box>
            <Divider />
          </div>
          <form onSubmit={handleSubmit(handleClick)}>
            <Stack spacing={3}>
              <TextField
                name="title"
                label="Title"
                {...register("title", { required: true })}
                error={Boolean(errors.title)}
                helperText={errors.title && errors.title.message}
                inputProps={{
                  "data-testid": "title",
                }}
              />

              <TextField
                name="description"
                label="Description"
                multiline
                rows={4}
                {...register("description", { required: true })}
                error={Boolean(errors.description)}
                helperText={errors.description && errors.description.message}
              />

              <TextField
                name="price"
                label="Price"
                type="number"
                {...register("price", { required: true })}
                error={Boolean(errors.price)}
                helperText={errors.price && errors.price.message}
              />

              <TextField
                name="instructorName"
                label="InstructorName"
                {...register("instructorName", { required: true })}
                error={Boolean(errors.instructorName)}
                helperText={
                  errors.instructorName && errors.instructorName.message
                }
              />

              <TextField
                name="totalDuration"
                label="Total Duration"
                {...register("totalDuration", { required: true })}
                error={Boolean(errors.totalDuration)}
                helperText={
                  errors.totalDuration && errors.totalDuration.message
                }
              />

              <TextField
                name="thumbnail"
                label="Thumbnail"
                {...register("thumbnail", { required: true })}
                error={Boolean(errors.thumbnail)}
                helperText={errors.thumbnail && errors.thumbnail.message}
              />

              <Autocomplete
                multiple
                id="tags-filled"
                options={[]}
                freeSolo
                value={watch("category") || []}
                renderTags={(value, getTagProps) =>
                  value?.map((option, index) => (
                    <Chip
                      key={index}
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                {...register("category", { required: true })}
                onChange={(e, value) => {
                  setValue(`category`, value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    // {...item}
                    fullWidth
                    label="Categories"
                    error={Boolean(errors.category)}
                    helperText={errors.category && errors.tags.category}
                  />
                )}
              />

              {!edit &&
                fields.map((item, index) => (
                  // <Container
                  //   key={item.id}
                  //   sx={{
                  //     display: "flex",
                  //     justifyContent: "space-between",
                  //     alignItems: "center",
                  //     px: "0 !important",
                  //   }}
                  // >
                  //   <TextField
                  //     label="English Word"
                  //     variant="outlined"
                  //     {...register(`englishWords.${index}`, {
                  //       required: "English word is required",
                  //     })}
                  //     error={!!errors?.englishWords?.[index]?.message}
                  //     helperText={errors?.englishWords?.[index]?.message}
                  //     fullWidth
                  //     inputProps={{ "data-testid": `englishWord.${index}` }}
                  //   />
                  //   <IconButton
                  //     onClick={() => deleteCourseLinkHandler(index)}
                  //     data-testid={`delete.${index}`}
                  //   >
                  //     <Delete width={20} height={20} />
                  //   </IconButton>
                  // </Container>
                  <Container
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: "0 !important",
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="Label"
                      variant="outlined"
                      {...register(`lectureLinks.${index}.label`, {
                        required: "Title is required",
                      })}
                      error={!!errors?.lectureLinks?.[index]?.label}
                      helperText={errors?.lectureLinks?.[index]?.label}
                      fullWidth
                    />
                    <TextField
                      label="Link"
                      variant="outlined"
                      {...register(`lectureLinks.${index}.link`, {
                        required: "Link is required",
                      })}
                      error={!!errors?.lectureLinks?.[index]?.link}
                      helperText={errors?.lectureLinks?.[index]?.link}
                      fullWidth
                    />
                    <IconButton onClick={() => deleteCourseLinkHandler(index)}>
                      <Iconify icon="eva:close-fill" />
                    </IconButton>
                  </Container>
                ))}
              {!edit && (
                <Stack direction="row">
                  <Button
                    type="button"
                    variant="text"
                    onClick={addCourseLinkHandler}
                  >
                    <Add />
                    Add Link
                  </Button>
                </Stack>
              )}

              <LoadingButton
                type="submit"
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  width: isMedium ? "100%" : 240,
                }}
                loading={isLoading || isEditLoading}
              >
                Submit
              </LoadingButton>
            </Stack>
          </form>
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}
