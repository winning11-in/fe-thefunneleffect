import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  FormHelperText,
  Divider,
  IconButton,
} from "@mui/material";
import { Image } from "@mui/icons-material";
import { pagesAPI } from "../services/api";
import SummernoteEditor, {
  SummernoteEditorRef,
} from "../components/SummernoteEditor";
import ImageDialog from "../components/ImageDialog";
import AudioDialog from "../components/AudioDialog";
import { useAppDispatch } from "../store/hooks";
import { createPage, updatePage } from "../store/slices/pagesSlice";
import { useAIGeneration, AIProvider } from "../hooks/useAIGeneration";
import type { CreatePageData } from "../types";

// Group options for the select dropdown
const GROUP_OPTIONS = [
  { value: "blogs", label: "Blogs" },
  { value: "cardiology", label: "Cardiology" },
  { value: "case-studies", label: "Case Studies" },
];

const pageSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .max(200, "Title cannot be more than 200 characters"),
  description: yup
    .string()
    .required("Description is required")
    .max(500, "Description cannot be more than 500 characters"),
  imageUrl: yup
    .string()
    .required("Image URL is required")
    .url("Must be a valid URL"),
  thumbnailUrl: yup
    .string()
    .required("Thumbnail URL is required")
    .url("Must be a valid URL"),
  audioUrl: yup.string().optional(),
  groups: yup
    .array()
    .of(yup.string().required().oneOf(["blogs", "cardiology", "case-studies"], "Invalid group option"))
    .defined()
    .default([])
    .max(10, "Cannot have more than 10 groups"),

  slug: yup
    .string()
    .optional()
    .max(100, "Slug cannot be more than 100 characters")
    .matches(
      /^[a-z0-9-]*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  content: yup.string(),
  metaTitle: yup
    .string()
    .optional()
    .max(60, "Meta title cannot be more than 60 characters"),
  metaDescription: yup
    .string()
    .optional()
    .max(160, "Meta description cannot be more than 160 characters"),
  metaKeywords: yup
    .string()
    .optional()
    .max(255, "Meta keywords cannot be more than 255 characters"),
  popular: yup
    .boolean()
    .optional(),
  tags: yup
    .array()
    .of(yup.string().required())
    .default([])
    .max(20, "Cannot have more than 20 tags"),
  category: yup
    .string()
    .optional()
    .max(100, "Category cannot be more than 100 characters"),
  readTime: yup
    .number()
    .optional()
    .min(1, "Read time must be at least 1 minute")
    .max(999, "Read time cannot exceed 999 minutes")
    .integer("Read time must be a whole number"),
}) satisfies yup.ObjectSchema<CreatePageData>;

const PageForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAI, setSelectedAI] = useState<AIProvider>("gemini");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [thumbnailDialogOpen, setThumbnailDialogOpen] = useState(false);
  const [audioDialogOpen, setAudioDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const { generateContent, generating } = useAIGeneration({
    onContentGenerated: (content: string) => {
      setValue("content", content);
    },
    onError: (errorMessage: string) => {
      setError(errorMessage);
    },
  });

  const summernoteRef = useRef<SummernoteEditorRef>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreatePageData>({
    resolver: yupResolver(pageSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      thumbnailUrl: "",
      audioUrl: "",
      groups: [],
      slug: "",
      content: undefined,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      popular: undefined,
      tags: [],
      category: "",
      readTime: undefined,
    },
  });

  const watchedTitle = watch("title");
  const watchedTags = watch("tags");

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !isEditing) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  }, [watchedTitle, setValue, isEditing]);

  // Load page data for editing
  useEffect(() => {
    if (isEditing && id) {
      const loadPage = async () => {
        try {
          setLoading(true);
          const response = await pagesAPI.getById(id);
          const page = response.data;

          reset({
            title: page.title,
            description: page.description,
            imageUrl: page.imageUrl,
            thumbnailUrl: page.thumbnailUrl,
            audioUrl: page.audioUrl,
            groups: page.groups,
            slug: page.slug,
            content: page.content,
            metaTitle: page.metaTitle || "",
            metaDescription: page.metaDescription || "",
            metaKeywords: page.metaKeywords || "",
            popular: page.popular || false,
            tags: page.tags || [],
            category: page.category || "",
            readTime: page.readTime || undefined,
          });
        } catch (err) {
          console.error("Error loading page:", err);
          setError("Failed to load page data");
        } finally {
          setLoading(false);
        }
      };

      loadPage();
    }
  }, [id, isEditing, reset]);

  const onSubmit = async (data: CreatePageData) => {
    let currentContent = data.content;
    if (summernoteRef.current) {
      currentContent = summernoteRef.current.getContent();
    }
    const finalData = { ...data, content: currentContent };
    try {
      setLoading(true);
      setError(null);

      if (isEditing && id) {
        await dispatch(updatePage({ id, pageData: finalData }));
      } else {
        await dispatch(createPage(finalData));
      }
      navigate("/pages");
    } catch (err) {
      console.error("Error saving page:", err);
      setError(isEditing ? "Failed to update page" : "Failed to create page");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = () => {
    const title = watch("title");
    const description = watch("description");
    generateContent(selectedAI, title, description);
  };

  const handleAddTag = () => {
    const currentTags = watchedTags || [];
    if (tagInput.trim() && !currentTags.includes(tagInput.trim()) && currentTags.length < 20) {
      setValue("tags", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = watchedTags || [];
    setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleTagInputKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setValue("imageUrl", imageUrl);
  };

  const handleThumbnailSelect = (imageUrl: string) => {
    setValue("thumbnailUrl", imageUrl);
  };

  const handleAudioSelect = (audioUrl: string) => {
    setValue("audioUrl", audioUrl);
  };

  if (loading && isEditing) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isEditing ? "Edit Page" : "Create New Page"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ py: 2 }}>
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <Box
            sx={{
              display: "flex",
              gap: 0,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Left Column - Other Fields */}
            <Box
              sx={{
                flex: "0 0 30%",
                minWidth: 0,
                height: "calc(100vh - 120px)",
                overflowY: "auto",
                pr: 2,
                borderRadius: 2,
                scrollbarWidth: "thin",
                scrollbarColor: "grey.400 grey.100",
                "&::-webkit-scrollbar": {
                  width: "8px",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "grey.100",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "grey.400",
                  borderRadius: "4px",
                  transition: "background-color 0.3s ease",
                  "&:hover": {
                    backgroundColor: "grey.500",
                  },
                },
                "&:hover": {
                  "&::-webkit-scrollbar": {
                    opacity: 1,
                  },
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
                Page Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Title *
                  </Typography>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Slug
                  </Typography>
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        error={!!errors.slug}
                        helperText={errors.slug?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Description *
                  </Typography>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Image URL *
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Controller
                      name="imageUrl"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          placeholder="Enter image URL or select from gallery"
                          error={!!errors.imageUrl}
                          helperText={errors.imageUrl?.message}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                            },
                          }}
                        />
                      )}
                    />
                    <IconButton
                      onClick={() => setImageDialogOpen(true)}
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <Image />
                    </IconButton>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Thumbnail URL *
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Controller
                      name="thumbnailUrl"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          placeholder="Enter thumbnail URL or select from gallery"
                          error={!!errors.thumbnailUrl}
                          helperText={errors.thumbnailUrl?.message}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                            },
                          }}
                        />
                      )}
                    />
                    <IconButton
                      onClick={() => setThumbnailDialogOpen(true)}
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <Image />
                    </IconButton>
                  </Box>
                </Grid>

                {/* <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Audio URL
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Controller
                      name="audioUrl"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          placeholder="Enter audio URL or select from gallery"
                          error={!!errors.audioUrl}
                          helperText={errors.audioUrl?.message}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                            },
                          }}
                        />
                      )}
                    />
                    <IconButton
                      onClick={() => setAudioDialogOpen(true)}
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <Audiotrack />
                    </IconButton>
                  </Box>
                </Grid> */}



                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Groups
                  </Typography>
                  <Controller
                    name="groups"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.groups}>
                        <Select
                          {...field}
                          multiple
                          value={field.value || []}
                          renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {(selected as string[]).map((value) => (
                                <Chip
                                  key={value}
                                  label={GROUP_OPTIONS.find(option => option.value === value)?.label || value}
                                  size="small"
                                />
                              ))}
                            </Box>
                          )}
                          sx={{
                            borderRadius: "8px",
                          }}
                        >
                          {GROUP_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.groups && (
                          <FormHelperText>{errors.groups.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Popular Post
                  </Typography>
                  <Controller
                    name="popular"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.popular}>
                        <Select
                          {...field}
                          value={field.value ? "true" : "false"}
                          onChange={(e) => field.onChange(e.target.value === "true")}
                          sx={{
                            borderRadius: "8px",
                          }}
                        >
                          <MenuItem value="false">No</MenuItem>
                          <MenuItem value="true">Yes</MenuItem>
                        </Select>
                        {errors.popular && (
                          <FormHelperText>{errors.popular.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Tags
                  </Typography>
                  <Box>
                    <TextField
                      fullWidth
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      placeholder="Add tags (max 20)"
                      helperText={`${(watchedTags || []).length}/20 tags`}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                        },
                      }}
                    />
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                    >
                      {(watchedTags || []).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Category
                  </Typography>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Enter category"
                        error={!!errors.category}
                        helperText={errors.category?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Read Time (minutes)
                  </Typography>
                  <Controller
                    name="readTime"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        placeholder="Enter read time in minutes"
                        error={!!errors.readTime}
                        helperText={errors.readTime?.message}
                        inputProps={{ min: 1, max: 999 }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* SEO Fields Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2, color: "primary.main" }}>
                    SEO Settings
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Meta Title
                  </Typography>
                  <Controller
                    name="metaTitle"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="SEO meta title (max 60 characters)"
                        error={!!errors.metaTitle}
                        helperText={errors.metaTitle?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Meta Description
                  </Typography>
                  <Controller
                    name="metaDescription"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="SEO meta description (max 160 characters)"
                        error={!!errors.metaDescription}
                        helperText={errors.metaDescription?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                    Meta Keywords
                  </Typography>
                  <Controller
                    name="metaKeywords"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="SEO meta keywords (comma separated, max 255 characters)"
                        error={!!errors.metaKeywords}
                        helperText={errors.metaKeywords?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Divider */}
            <Divider
              orientation="vertical"
              sx={{
                display: { xs: "none", md: "block" },
                mx: 2,
                width: "10px",
                height: "auto",
                alignSelf: "stretch",
              }}
            />

            {/* Right Column - Content */}
            <Box sx={{ flex: "1", minWidth: 0, pl: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontSize: "13px" }}
                          >
                            Content
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "center",
                            }}
                          >
                            <FormControl sx={{ minWidth: 200 }}>
                              <Select
                                value={selectedAI}
                                onChange={(e) =>
                                  setSelectedAI(e.target.value as AIProvider)
                                }
                                displayEmpty
                                size="small"
                              >
                                <MenuItem value="gemini">Gemini</MenuItem>
                                <MenuItem value="perplexity">
                                  Perplexity
                                </MenuItem>
                              </Select>
                            </FormControl>
                            <Button
                              variant="contained"
                              onClick={handleGenerateContent}
                              size="large"
                              sx={{
                                minWidth: 150,
                                borderRadius: "8px",
                                boxShadow: "none",
                                color: "#fff",
                              }}
                            >
                              {generating ? (
                                <CircularProgress
                                  size={18}
                                  sx={{ color: "#fff", marginRight: "8px" }}
                                />
                              ) : (
                                ""
                              )}
                              Generate with AI
                            </Button>
                          </Box>
                        </Box>
                        {/* Summernote Editor */}
                        <Box
                          sx={{
                            "& .note-editable": {
                              backgroundColor: "#ffffff",
                              minHeight: "600px",
                              lineHeight: "1.5 !important",
                              fontFamily: "'Inter', sans-serif",
                            },
                          }}
                        >
                          <SummernoteEditor
                            ref={summernoteRef}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter your page content here..."
                            height={11800}
                          />
                        </Box>
                        {errors.content && (
                          <FormHelperText error>
                            {errors.content.message}
                          </FormHelperText>
                        )}
                      </Box>
                    )}
                  />
                </Grid>

                {/* Submit Buttons - Right Section */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      justifyContent: "flex-end",
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/pages")}
                      disabled={loading}
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 500,
                        px: 3,
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 500,
                        px: 3,
                      }}
                    >
                      {loading ? (
                        <CircularProgress
                          size={16}
                          style={{ color: "#fff", marginRight: "8px" }}
                        />
                      ) : (
                        ""
                      )}
                      Save
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </form>
      </Box>

      <ImageDialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        onSelectImage={handleImageSelect}
      />

      <ImageDialog
        open={thumbnailDialogOpen}
        onClose={() => setThumbnailDialogOpen(false)}
        onSelectImage={handleThumbnailSelect}
      />

      <AudioDialog
        open={audioDialogOpen}
        onClose={() => setAudioDialogOpen(false)}
        onSelectAudio={handleAudioSelect}
      />
    </Box>
  );
};

export default PageForm;
